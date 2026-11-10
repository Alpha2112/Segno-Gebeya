<?php

namespace App\Http\Controllers;

use App\Domain\Audit;
use App\Domain\Merchants\Applications;
use App\Models\ApplicationDocument;
use App\Models\MerchantApplication;
use App\Models\ReviewConfirmation;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class AdminApplicationController
{
    private function recentPassword(Request $r): void
    {
        abort_unless($r->hasSession() && time() - (int) $r->session()->get('admin_password_at', 0) < 600, 403, 'Sign in again before recording a privileged decision.');
    }

    public function start(Request $r, string $id): array
    {
        $v = $r->validate(['revision' => 'required|integer|min:1']);

        return DB::transaction(function () use ($r, $id, $v) {
            $a = MerchantApplication::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_if($a->revision !== $v['revision'], 409, 'This application changed. Refresh before reviewing.');
            abort_unless(in_array($a->status, ['submitted', 'resubmitted', 'under_review'], true), 409);
            if ($a->status !== 'under_review') {
                $a->status = 'under_review';
                $a->revision++;
                $a->save();
                Audit::record('merchant.review_started', $r->user()->id, $id);
            }

            return ['application' => Applications::view($a, true)];
        });
    }

    public function index(Request $r): array
    {
        $v = $r->validate(['search' => 'nullable|string|max:100', 'status' => ['nullable', Rule::in(['submitted', 'resubmitted', 'under_review', 'information_needed', 'approved', 'rejected'])], 'page' => 'nullable|integer|min:1']);
        $q = MerchantApplication::query()->where('status', '!=', 'draft')->latest();
        if (! empty($v['search'])) {
            $q->where('store_name', 'like', '%'.addcslashes($v['search'], '%_\\').'%');
        }if (! empty($v['status'])) {
            $q->where('status', $v['status']);
        }
        $p = $q->paginate(20);

        return ['applications' => $p->getCollection()->map(fn ($a) => Applications::view($a)), 'page' => $p->currentPage(), 'last_page' => $p->lastPage(), 'total' => $p->total()];
    }

    public function show(string $id): array
    {
        $a = MerchantApplication::findOrFail($id);
        abort_if($a->status === 'draft', 404);

        return ['application' => Applications::view($a, true)];
    }

    public function document(Request $r, string $id, string $document): mixed
    {
        $a = MerchantApplication::findOrFail($id);
        abort_if($a->status === 'draft', 404);
        $d = ApplicationDocument::query()->whereKey($document)->where('merchant_application_id', $id)->firstOrFail();
        Audit::record('merchant.document_downloaded', $r->user()->id, $d->id);

        return Storage::disk('local')->download($d->path, Str::ascii($d->name), ['Content-Type' => 'application/octet-stream', 'Content-Security-Policy' => "sandbox; default-src 'none'"]);
    }

    public function propose(Request $r, string $id): array
    {
        $this->recentPassword($r);
        $v = $r->validate(['action' => ['required', Rule::in(['approve', 'reject', 'request_information'])], 'reason' => 'required|string|min:3|max:1000', 'revision' => 'required|integer|min:1']);
        $a = MerchantApplication::findOrFail($id);
        abort_unless(in_array($a->status, ['submitted', 'resubmitted', 'under_review'], true), 409);
        abort_if($a->revision !== $v['revision'], 409, 'This application changed. Refresh before reviewing.');
        $token = Str::random(64);
        $c = ReviewConfirmation::create(['merchant_application_id' => $a->id, 'actor_id' => $r->user()->id, 'token_hash' => hash('sha256', $token), 'revision' => $v['revision'], 'action' => $v['action'], 'reason' => $v['reason'], 'expires_at' => now()->addMinutes(5)]);

        return ['confirmation_id' => $c->id, 'token' => $token, 'expires_in' => 300, 'summary' => ['store_name' => $a->store_name, 'action' => $v['action'], 'reason' => $v['reason'], 'revision' => $v['revision']]];
    }

    public function confirm(Request $r, string $id, Applications $applications): array
    {
        $this->recentPassword($r);
        $v = $r->validate(['token' => 'required|string|size:64']);

        return $applications->confirm($r->user(), $id, $v['token']);
    }

    public function suspend(Request $r, int $id): array
    {
        $this->recentPassword($r);
        $r->validate(['reason' => 'required|string|min:3|max:1000']);
        $store = Store::findOrFail($id);
        $store->status = 'suspended';
        $store->save();
        Audit::record('merchant.store_suspended', $r->user()->id, (string) $id);

        return ['message' => 'Store access suspended.'];
    }
}
