<?php

namespace App\Domain\Merchants;

use App\Domain\Audit;
use App\Domain\Identity\Capabilities;
use App\Models\MerchantApplication;
use App\Models\ReviewConfirmation;
use App\Models\Store;
use App\Models\StoreMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class Applications
{
    public static function view(MerchantApplication $a, bool $admin = false): array
    {
        $v = $a->only(['id', 'store_name', 'business_type', 'representative', 'status', 'revision', 'review_reason', 'submitted_at', 'created_at', 'updated_at']);
        $v['documents'] = DB::table('application_documents')->where('merchant_application_id', $a->id)->get(['id', 'name', 'mime', 'size'])->all();
        if ($admin) {
            $u = User::findOrFail($a->user_id);
            $v['applicant'] = $u->only(['id', 'name', 'email', 'phone']);
        }

        return $v;
    }

    public function confirm(User $actor, string $id, string $token): array
    {
        return DB::transaction(function () use ($actor, $id, $token) {
            $currentActor = User::query()->whereKey($actor->id)->lockForUpdate()->firstOrFail();
            abort_unless($currentActor->status === 'active' && Capabilities::isAdmin($currentActor), 403);
            $c = ReviewConfirmation::query()->whereKey($id)->where('actor_id', $actor->id)->lockForUpdate()->firstOrFail();
            abort_unless(hash_equals($c->token_hash, hash('sha256', $token)), 403, 'The confirmation could not be verified.');
            if ($c->consumed_at) {
                return $c->result;
            }
            abort_if($c->expires_at->isPast(), 409, 'This confirmation expired. Review the current application again.');
            $a = MerchantApplication::query()->whereKey($c->merchant_application_id)->lockForUpdate()->firstOrFail();
            abort_if($a->revision !== $c->revision, 409, 'This application changed. Refresh before making a decision.');
            abort_unless(in_array($a->status, ['submitted', 'resubmitted', 'under_review'], true), 409, 'This application is not available for review.');
            $a->status = match ($c->action) {
                'approve' => 'approved','reject' => 'rejected','request_information' => 'information_needed',default => abort(409, 'This review action is unavailable.')
            };
            $a->review_reason = $c->reason;
            $a->reviewed_by = $actor->id;
            $a->revision++;
            $a->save();
            if ($c->action === 'approve') {
                $store = Store::firstOrCreate(['merchant_application_id' => $a->id], ['name' => $a->store_name, 'status' => 'active']);
                StoreMember::firstOrCreate(['store_id' => $store->id, 'user_id' => $a->user_id], ['role' => 'owner', 'permissions' => ['store.read', 'store.manage'], 'active' => true]);
            }
            $result = ['application' => self::view($a), 'message' => 'The review decision was recorded.'];
            $c->consumed_at = now();
            $c->result = $result;
            $c->save();
            Audit::record('merchant.'.$c->action, $actor->id, $a->id, ['revision' => $a->revision]);

            return $result;
        });
    }
}
