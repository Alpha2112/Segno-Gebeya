<?php

namespace App\Http\Controllers;

use App\Domain\Audit;
use App\Domain\Identity\Capabilities;
use App\Domain\Identity\IdentityService;
use App\Models\Address;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class ProfileResourcesController
{
    public function preferences(Request $r): array
    {
        $v = $r->validate(['locale' => 'required|in:en,am', 'country' => 'sometimes|in:ET']);
        $r->user()->forceFill($v)->save();

        return ['user' => Capabilities::profile($r->user())];
    }

    public function addresses(Request $r): array
    {
        return ['addresses' => Address::where('user_id', $r->user()->id)->orderByDesc('is_default')->latest()->get()];
    }

    public function saveAddress(Request $r, ?string $id = null): array
    {
        $v = $r->validate(['label' => 'required|string|max:50', 'recipient' => 'required|string|max:120', 'phone' => 'required|string|max:32', 'country' => 'required|in:ET', 'city' => 'required|string|max:100', 'sub_city' => 'nullable|string|max:100', 'woreda' => 'nullable|string|max:80', 'house' => 'nullable|string|max:80', 'directions' => 'nullable|string|max:500', 'is_default' => 'required|boolean']);
        $v['phone'] = IdentityService::identifier($v['phone']);
        abort_if(str_contains($v['phone'], '@'), 422, 'Use a phone number for the address.');

        return DB::transaction(function () use ($r, $id, $v) {
            User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            $a = $id ? Address::whereKey($id)->where('user_id', $r->user()->id)->firstOrFail() : new Address(['user_id' => $r->user()->id]);
            $count = Address::where('user_id', $r->user()->id)->count();
            abort_if(! $id && $count >= 10, 422, 'A maximum of ten addresses is supported.');
            if ($count === 0) {
                $v['is_default'] = true;
            }if ($v['is_default']) {
                Address::where('user_id', $r->user()->id)->update(['is_default' => false]);
            }$a->fill($v)->save();

            return ['address' => $a];
        });
    }

    public function deleteAddress(Request $r, string $id): array
    {
        return DB::transaction(function () use ($r, $id) {
            User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            $a = Address::whereKey($id)->where('user_id', $r->user()->id)->firstOrFail();
            $default = $a->is_default;
            $a->delete();
            if ($default) {
                Address::where('user_id', $r->user()->id)->oldest()->first()?->update(['is_default' => true]);
            }

            return ['message' => 'Address removed.'];
        });
    }

    public function password(Request $r): array
    {
        $v = $r->validate(['current_password' => 'required|string', 'password' => 'required|string|min:12|max:128|confirmed']);
        abort_unless(Hash::check($v['current_password'], $r->user()->password), 422, 'The current password could not be verified.');
        DB::transaction(function () use ($r, $v) {
            $u = User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(Hash::check($v['current_password'], $u->password), 422);
            $u->forceFill(['password' => $v['password'], 'remember_token' => Str::random(60)])->save();
            $u->tokens()->delete();
            DB::table('sessions')->where('user_id', $u->id)->delete();
            Audit::record('identity.password_changed', $u->id, (string) $u->id);
        });
        if ($r->hasSession()) {
            Auth::guard('web')->logout();
            $r->session()->invalidate();
            $r->session()->regenerateToken();
        }

        return ['message' => 'Password changed. Sign in again on your devices.'];
    }

    public function photo(Request $r): mixed
    {
        abort_unless($r->user()->avatar_path !== null, 404);

        return Storage::disk('local')->response($r->user()->avatar_path, null, ['Content-Type' => 'image/png', 'Content-Security-Policy' => "default-src 'none'; sandbox"]);
    }

    public function uploadPhoto(Request $r): array
    {
        $r->validate(['photo' => 'required|file|mimes:jpg,jpeg,png|max:5120|dimensions:max_width=4096,max_height=4096']);
        abort_unless(function_exists('imagecreatefromstring'), 503, 'Image processing is unavailable.');
        $image = imagecreatefromstring(file_get_contents($r->file('photo')->getRealPath()));
        abort_if($image === false, 422, 'This image could not be read.');
        ob_start();
        imagepng($image);
        $encoded = ob_get_clean();
        $path = 'profile-photos/'.Str::uuid().'.png';
        Storage::disk('local')->put($path, $encoded);
        try {
            DB::transaction(function () use ($r, $path) {
                $u = User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
                $old = $u->avatar_path;
                $u->forceFill(['avatar_path' => $path])->save();
                if ($old) {
                    DB::afterCommit(fn () => Storage::disk('local')->delete($old));
                }
            });
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return ['user' => Capabilities::profile($r->user()->fresh())];
    }

    public function deletePhoto(Request $r): array
    {
        DB::transaction(function () use ($r) {
            $u = User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            $old = $u->avatar_path;
            $u->forceFill(['avatar_path' => null])->save();
            if ($old) {
                DB::afterCommit(fn () => Storage::disk('local')->delete($old));
            }
        });

        return ['user' => Capabilities::profile($r->user()->fresh())];
    }
}
