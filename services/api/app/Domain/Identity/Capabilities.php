<?php

namespace App\Domain\Identity;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class Capabilities
{
    public static function profile(User $user): array
    {
        $stores = DB::table('store_members')->join('stores', 'stores.id', '=', 'store_members.store_id')->where('user_id', $user->id)->where('active', true)->where('stores.status', 'active')->get(['stores.id', 'stores.name', 'store_members.role', 'store_members.permissions'])->map(fn ($s) => ['id' => $s->id, 'name' => $s->name, 'role' => $s->role, 'permissions' => json_decode($s->permissions, true)]);

        return ['photo_version' => substr(hash('sha256', $user->avatar_path ?? ''), 0, 12), 'id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone, 'username' => $user->username, 'bio' => $user->bio, 'locale' => $user->locale, 'country' => $user->country ?? 'ET', 'has_photo' => (bool) $user->avatar_path, 'verified' => (bool) ($user->email_verified_at || $user->phone_verified_at), 'roles' => $user->roles ?? [], 'stores' => $stores, 'mfa_enrolled' => (bool) $user->mfa_confirmed_at, 'deletion_requested_at' => $user->deletion_requested_at?->toIso8601String()];
    }

    public static function isAdmin(User $user): bool
    {
        return count(array_intersect($user->roles ?? [], ['administrator', 'super_administrator'])) > 0;
    }

    public static function store(User $user, int $storeId, string $permission = 'store.read'): object
    {
        $member = DB::table('store_members')->join('stores', 'stores.id', '=', 'store_members.store_id')->where('store_members.user_id', $user->id)->where('store_members.store_id', $storeId)->where('store_members.active', true)->where('stores.status', 'active')->first(['store_members.*', 'stores.name']);
        abort_unless($member && ($member->role === 'owner' || in_array($permission, json_decode($member->permissions, true), true)), 403, 'Store access is not available.');

        return $member;
    }
}
