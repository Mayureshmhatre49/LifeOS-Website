<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'featured_image', 
        'category_id', 'author_name', 'reading_time', 'meta_title', 
        'meta_description', 'is_published', 'published_at'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Reject non-http(s) URLs to prevent javascript: or data: URIs in img src
    public function setFeaturedImageAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['featured_image'] = null;
            return;
        }
        $parsed = parse_url($value);
        $this->attributes['featured_image'] = (isset($parsed['scheme']) && in_array(strtolower($parsed['scheme']), ['http', 'https'], true))
            ? $value
            : null;
    }
}
