<?php

return ['paths' => ['api/*', 'sanctum/csrf-cookie'], 'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 'allowed_origins' => explode(',', env('FRONTEND_ORIGINS', 'http://localhost:15173,http://localhost:15174,http://localhost:8081,http://127.0.0.1:8081')), 'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-Request-ID', 'X-Requested-With'], 'exposed_headers' => ['X-Request-ID'], 'max_age' => 600, 'supports_credentials' => true];
