<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function home()
    {
        return view('pages.home', [
            'title' => 'AI for Everyday Life | Personal Organization & Decision Support',
            'description' => 'HandleLife OS helps you reduce stress, make better decisions, and handle life with clarity. The foundational layer for your digital life.'
        ]);
    }

    public function features()
    {
        return view('pages.features', [
            'title' => 'AI Capabilities & Features',
            'description' => 'Explore the core features of HandleLife OS, from daily planning to financial clarity and security.'
        ]);
    }

    public function pricing()
    {
        return view('pages.pricing', [
            'title' => 'Simple, Transparent Pricing',
            'description' => 'Choose the plan that fits your life. No hidden fees, no credit card required to start.'
        ]);
    }

    public function families()
    {
        return view('pages.families', [
            'title' => 'AI for Families | Shared Coordination & Mental Load Support',
            'description' => 'End the mental load. Shared household coordination and family sync for modern families.'
        ]);
    }

    public function security()
    {
        return view('pages.security', [
            'title' => 'Privacy & Security First',
            'description' => 'Zero-knowledge architecture and AES-256 encryption. Your data stays yours — always.'
        ]);
    }

    public function enterprise()
    {
        return view('pages.enterprise', [
            'title' => 'Enterprise Partnerships',
            'description' => 'Bring HandleLife OS to your organization. Scalable, secure, and built for real-world impact.'
        ]);
    }

    public function about()
    {
        return view('pages.about', [
            'title' => 'Our Mission & Story',
            'description' => 'Learn why we built HandleLife OS and how we\'re helping people handle life better.'
        ]);
    }

    public function contact()
    {
        return view('pages.contact', [
            'title' => 'Get in Touch',
            'description' => 'Have questions or feedback? We\'d love to hear from you.'
        ]);
    }

    public function waitlist()
    {
        return view('pages.waitlist', [
            'title' => 'Join the Early Access Waitlist',
            'description' => 'Get early access to HandleLife OS and start handling your life with more clarity.'
        ]);
    }

    public function roadmap()
    {
        return view('pages.roadmap', [
            'title' => 'Implementation Roadmap | 10 Phases of HandleLife OS',
            'description' => 'Track our progress as we build the world\'s most capable personal AI operating system.'
        ]);
    }

    public function privacy()
    {
        return view('pages.privacy', [
            'title' => 'Privacy Policy | Your Data, Your Control',
            'description' => 'Our commitment to your privacy. Learn how HandleLife OS protects your personal data with zero-knowledge architecture.'
        ]);
    }

    public function terms()
    {
        return view('pages.terms', [
            'title' => 'Terms of Service | HandleLife OS',
            'description' => 'The terms and conditions for using HandleLife OS. Clear, fair, and designed for human understanding.'
        ]);
    }

}
