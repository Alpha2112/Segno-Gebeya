<?php

namespace App\Http\Controllers;

use App\Domain\Audit;
use App\Domain\Merchants\Applications;
use App\Models\ApplicationDocument;
use App\Models\MerchantApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class MerchantApplicationController
{
    private function owned(Request $r, string $id): MerchantApplication
    {
        return MerchantApplication::query()->whereKey($id)->where('user_id', $r->user()->id)->firstOrFail();
    }

    public function index(Request $r): array
    {
        return ['applications' => MerchantApplication::query()->where('user_id', $r->user()->id)->latest()->get()->map(fn ($a) => Applications::view($a)), 'evidence_policy' => config('segno.merchant_evidence_policy')];
    }

    public function create(Request $r): array
    {
        $v = $r->validate(['store_name' => 'required|string|max:120', 'business_type' => ['required', Rule::in(['individual', 'company'])], 'representative' => 'required|string|max:120']);

        return DB::transaction(function () use ($r, $v) {
            DB::table('users')->where('id', $r->user()->id)->lockForUpdate()->first();
            abort_if(MerchantApplication::query()->where('user_id', $r->user()->id)->whereNotIn('status', ['approved', 'rejected'])->exists(), 409, 'Continue your existing application.');
            $a = MerchantApplication::create([...$v, 'user_id' => $r->user()->id]);
            Audit::record('merchant.application_created', $r->user()->id, $a->id);

            return ['application' => Applications::view($a)];
        });
    }

    public function update(Request $r, string $id): array
    {
        $v = $r->validate(['store_name' => 'required|string|max:120', 'business_type' => ['required', Rule::in(['individual', 'company'])], 'representative' => 'required|string|max:120', 'revision' => 'required|integer|min:1']);

        return DB::transaction(function () use ($r, $id, $v) {
            $a = MerchantApplication::query()->whereKey($id)->where('user_id', $r->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($a->status, ['draft', 'information_needed'], true), 409, 'This application cannot be edited now.');
            abort_if($a->revision !== $v['revision'], 409, 'This application changed. Refresh before saving.');
            unset($v['revision']);
            $a->fill($v);
            $a->revision++;
            $a->save();

            return ['application' => Applications::view($a)];
        });
    }

    public function document(Request $r, string $id): array
    {
        $r->validate(['document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120']);
        $a = $this->owned($r, $id);
        abort_unless(in_array($a->status, ['draft', 'information_needed'], true), 409);
        $file = $r->file('document');
        $path = $file->store('merchant-evidence', 'local');
        try {
            return DB::transaction(function () use ($r, $id, $file, $path) {
                $a = MerchantApplication::query()->whereKey($id)->where('user_id', $r->user()->id)->lockForUpdate()->firstOrFail();
                abort_unless(in_array($a->status, ['draft', 'information_needed'], true), 409);
                abort_if(ApplicationDocument::query()->where('merchant_application_id', $id)->count() >= 5, 422, 'A maximum of five documents is supported.');
                $doc = ApplicationDocument::create(['merchant_application_id' => $id, 'path' => $path, 'name' => Str::limit(basename($file->getClientOriginalName()), 160, ''), 'mime' => $file->getMimeType(), 'size' => $file->getSize()]);
                $a->revision++;
                $a->save();
                Audit::record('merchant.document_uploaded', $r->user()->id, $doc->id);

                return ['application' => Applications::view($a)];
            });
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }
    }

    public function submit(Request $r, string $id): array
    {
        $v = $r->validate(['revision' => 'required|integer|min:1', 'declaration' => 'accepted']);

        return DB::transaction(function () use ($r, $id, $v) {
            $a = MerchantApplication::query()->whereKey($id)->where('user_id', $r->user()->id)->lockForUpdate()->firstOrFail();
            abort_if($a->revision !== $v['revision'], 409, 'This application changed. Refresh before submitting.');
            abort_unless(in_array($a->status, ['draft', 'information_needed'], true), 409);
            // Development evidence policy is explicitly not legal verification. Production rollout requires approved policy.
            abort_unless(config('segno.merchant_evidence_policy') === 'development-review-only' && app()->environment(['local', 'testing']), 503, 'Merchant verification policy is not configured for production.');
            $a->status = $a->status === 'information_needed' ? 'resubmitted' : 'submitted';
            $a->submitted_at = now();
            $a->revision++;
            $a->save();
            Audit::record('merchant.application_submitted', $r->user()->id, $a->id);

            return ['application' => Applications::view($a)];
        });
    }

    public function deleteDocument(Request $r, string $id, string $document): array
    {
        return DB::transaction(function () use ($r, $id, $document) {
            $a = MerchantApplication::query()->whereKey($id)->where('user_id', $r->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($a->status, ['draft', 'information_needed'], true), 409);
            $d = ApplicationDocument::query()->whereKey($document)->where('merchant_application_id', $id)->firstOrFail();
            $path = $d->path;
            $d->delete();
            $a->revision++;
            $a->save();
            DB::afterCommit(fn () => Storage::disk('local')->delete($path));

            return ['application' => Applications::view($a)];
        });
    }
}
