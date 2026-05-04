<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;

class PageController extends Controller
{
    public function home()
    {
        return view('pages.home', [
            'title'       => 'AI for Everyday Life — Personal Life Operating System',
            'description' => 'Reduce mental load, make smarter decisions, and handle daily life with AI. Privacy-first personal life OS for individuals and families. Join 50,000+ on the waitlist.',
            'keywords'    => 'AI life assistant, personal AI, mental load app, life operating system, household management software, decision making AI, family coordination, personal organizer AI, daily planner AI, privacy first AI',
        ]);
    }

    public function features()
    {
        return view('pages.features', [
            'title'       => 'Features & AI Capabilities',
            'description' => 'Daily planning, financial clarity, scam protection, family coordination, and more. Explore every capability of HandleLife OS — built to handle real life.',
            'keywords'    => 'AI features, daily planner AI, financial AI, scam detection AI, contract analyzer, smart routines, family sync, household AI, productivity capabilities',
        ]);
    }

    public function pricing()
    {
        return view('pages.pricing', [
            'title'       => 'Pricing & Plans',
            'description' => 'Free forever to start. Plus, Family Hub, and Enterprise plans available in 10+ currencies and 190+ countries. No credit card required. Cancel anytime.',
            'keywords'    => 'HandleLife OS pricing, AI life assistant pricing, family AI plan, personal AI plan, free AI assistant, subscription plans, monthly pricing, yearly pricing',
        ]);
    }

    public function families()
    {
        return view('pages.families', [
            'title'       => 'AI for Families — Shared Coordination',
            'description' => 'End the mental load. HandleLife OS coordinates schedules, chores, eldercare, childcare, and shopping for the whole household. Built for every family.',
            'keywords'    => 'family AI, household management app, shared family planner, mental load app, family coordination software, eldercare app, childcare planner, family sync',
        ]);
    }

    public function security()
    {
        return view('pages.security', [
            'title'       => 'Privacy & Security — Zero-Knowledge AI',
            'description' => 'AES-256 encryption. Zero-knowledge architecture. GDPR, CCPA, PDPA compliant. Your personal data never trains models. Your life stays yours — forever.',
            'keywords'    => 'private AI, zero knowledge AI, encrypted AI assistant, GDPR AI, secure personal AI, AES-256, no tracking AI, data privacy first',
        ]);
    }

    public function enterprise()
    {
        return view('pages.enterprise', [
            'title'       => 'Enterprise & Partnerships',
            'description' => 'Bring HandleLife OS to your employees, customers, or members. Enterprise-grade security, SSO, dedicated support, and global rollout in 190+ countries.',
            'keywords'    => 'enterprise AI, employee wellbeing AI, B2B AI partnerships, white label AI, SSO AI assistant, corporate productivity AI',
        ]);
    }

    public function about()
    {
        return view('pages.about', [
            'title'       => 'Our Mission & Story',
            'description' => 'We built HandleLife OS to give every person — anywhere in the world — calm, clarity, and control. Learn the philosophy behind the personal life OS.',
            'keywords'    => 'HandleLife OS mission, AI philosophy, ethical AI, human-centered AI, founder story, why HandleLife',
        ]);
    }

    public function contact()
    {
        return view('pages.contact', [
            'title'       => 'Contact Us',
            'description' => 'Reach the HandleLife OS team for partnerships, demos, sales, support, or general questions. Global support across North America, Europe, India, MEA, APAC.',
            'keywords'    => 'contact HandleLife OS, AI assistant support, partnership inquiry, demo request, sales contact',
        ]);
    }

    public function waitlist()
    {
        return view('pages.waitlist', [
            'title'       => 'Join the Early Access Waitlist',
            'description' => 'Be among the first 50,000+ to try HandleLife OS. Free early access, no credit card. Built for individuals, families, students, caregivers, and everyone in between.',
            'keywords'    => 'AI waitlist, early access AI, HandleLife OS signup, beta AI assistant, free AI signup',
        ]);
    }

    public function roadmap()
    {
        return view('pages.roadmap', [
            'title'       => 'Product Roadmap — 10 Phases',
            'description' => 'Track HandleLife OS as we build the world\'s most capable personal life AI. 10 phases: from Core Assistant to global Memory Engine. Always shipping in public.',
            'keywords'    => 'HandleLife OS roadmap, AI product roadmap, AI release timeline, public roadmap, AI phases',
        ]);
    }

    public function privacy()
    {
        return view('pages.privacy', [
            'title'       => 'Privacy Policy',
            'description' => 'How HandleLife OS collects, uses, and protects your personal data. GDPR, CCPA, PDPA compliant. Your data is never sold. Zero-knowledge architecture by default.',
            'keywords'    => 'HandleLife OS privacy policy, GDPR compliance, data protection, personal data rights',
            'robots'      => 'index, follow, max-snippet:0',
        ]);
    }

    public function terms()
    {
        return view('pages.terms', [
            'title'       => 'Terms of Service',
            'description' => 'The terms governing your use of HandleLife OS. Clear, fair, written for human understanding — not legalese. Read before signing up for early access.',
            'keywords'    => 'HandleLife OS terms, terms of service, terms and conditions, user agreement',
            'robots'      => 'index, follow, max-snippet:0',
        ]);
    }
}
