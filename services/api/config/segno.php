<?php

return ['schema_version' => '1.0.0', 'development_otp' => (bool) env('SEGNO_DEVELOPMENT_OTP', false), 'web_idle_minutes' => 120, 'web_absolute_hours' => 12, 'admin_idle_minutes' => 15, 'admin_absolute_hours' => 8, 'confirmation_minutes' => 5, 'token_days' => 7, 'merchant_evidence_policy' => env('SEGNO_EVIDENCE_POLICY', 'unqualified')];
