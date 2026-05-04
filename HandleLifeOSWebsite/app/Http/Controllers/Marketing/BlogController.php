<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        // Simple collection for now to support 'SEO Weapon' blog strategy
        $posts = Post::with('category')
            ->where('is_published', true)
            ->latest('published_at')
            ->paginate(12);

        $categories = Category::all();

        return view('pages.blog.index', compact('posts', 'categories'));
    }

    public function show($slug)
    {
        $post = Post::with('category')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return view('pages.blog.show', compact('post'));
    }
}
