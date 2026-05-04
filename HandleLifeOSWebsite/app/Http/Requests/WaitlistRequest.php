<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WaitlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'       => ['required', 'email:rfc,dns', 'max:254', 'unique:waitlist,email'],
            '_hp_website' => ['present', 'max:0'],   // honeypot: must exist and be empty
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'       => 'This email is already on our waitlist.',
            'email.email'        => 'Please enter a valid email address.',
            '_hp_website.max'    => 'Submission rejected.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalise email: lowercase + trim
        if ($this->email) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
    }
}
