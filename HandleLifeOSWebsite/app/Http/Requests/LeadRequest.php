<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\p{M}\s\'\-\.]+$/u'],
            'email'        => ['required', 'email:rfc,dns', 'max:254'],
            'company_name' => ['nullable', 'string', 'max:150', 'regex:/^[\p{L}\p{M}\d\s&\'\-\.,]+$/u'],
            'inquiry_type' => ['required', 'string', 'in:general,enterprise,partnership,press,support,other'],
            'message'      => ['nullable', 'string', 'max:2000'],
            '_hp_website'  => ['present', 'max:0'],   // honeypot: must exist and be empty
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex'         => 'Name contains invalid characters.',
            'company_name.regex' => 'Company name contains invalid characters.',
            'inquiry_type.in'    => 'Please select a valid inquiry type.',
            '_hp_website.max'    => 'Submission rejected.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitise string inputs — strip control characters and trim whitespace
        $this->merge([
            'name'         => $this->sanitise($this->name),
            'company_name' => $this->sanitise($this->company_name),
            'message'      => $this->sanitise($this->message),
        ]);
    }

    private function sanitise(?string $value): ?string
    {
        if ($value === null) return null;
        // Remove control characters (except \n, \r, \t)
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
        return trim($clean);
    }
}
