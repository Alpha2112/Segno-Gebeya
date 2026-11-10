<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

final class DeliverVerificationEmail implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(private string $identifier, private string $code) {}

    public function handle(): void
    {
        // Draft bilingual pilot copy; native-language review remains an acceptance gate.
        $body = 'Your Segno Gebeya verification code is '.$this->code.'. It expires in five minutes. Never share this code.';
        $body .= "\n\n".'የSegno Gebeya የማረጋገጫ ኮድዎ '.$this->code.' ነው። በአምስት ደቂቃዎች ውስጥ ጊዜው ያበቃል። ይህን ኮድ ለማንም አያጋሩ።';
        Mail::raw($body, fn ($m) => $m->to($this->identifier)->subject('Segno Gebeya verification'));
    }
}
