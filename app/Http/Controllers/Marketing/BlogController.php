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
        $categories = Category::all();

        $activeCategory = null;
        $query = Post::with('category')->where('is_published', true);

        if ($request->filled('category')) {
            // Validate slug format — only allow [a-z0-9-] to prevent injection/enumeration
            $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($request->query('category')));
            if ($slug !== '') {
                $activeCategory = $categories->firstWhere('slug', $slug);
                if ($activeCategory) {
                    $query->where('category_id', $activeCategory->id);
                }
            }
        }

        $posts = $query->latest('published_at')->paginate(12)->withQueryString();

        return view('pages.blog.index', compact('posts', 'categories', 'activeCategory'));
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
