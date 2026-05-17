<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;

class PageController extends Controller
{
    public function home()
    {
        return view('pages.home', [
            'title'       => 'AI for Everyday Life — Personal Life Operating System',
            'description' => 'HandleLife OS is an AI operating system for daily life. It manages tasks, money, digital threats, and family coordination — privately, intelligently, without ads. Free to start. Used by 50,000+ people in 100+ countries.',
            'keywords'    => 'AI life assistant, personal AI operating system, mental load app, life operating system, household management software, decision making AI, family coordination, AI daily planner, zero knowledge AI, privacy first AI',
        ]);
    }

    public function features()
    {
        return view('pages.features', [
            'title'       => 'Features — Daily OS, Financial AI & Shield Protection',
            'description' => 'HandleLife OS includes four AI modules: Daily OS for task planning, Financial OS for money clarity, Shield OS for scam and contract protection, and Family OS for household coordination. All privacy-first.',
            'keywords'    => 'AI daily planner features, financial AI tools, scam detection AI, contract analyzer, family coordination app, household AI system, mental load reduction, smart routines, privacy AI features',
        ]);
    }

    public function pricing()
    {
        return view('pages.pricing', [
            'title'       => 'Pricing — Free Forever, Paid Plans from ₹199/mo',
            'description' => 'HandleLife OS is free to start. Paid plans — Lite (₹199/mo), Plus (₹499/mo), Family (₹999/mo) — unlock more AI credits and features. Available in 20 currencies. No credit card required.',
            'keywords'    => 'HandleLife OS pricing, free AI life assistant, Lite plan, Plus plan, Family OS plan, AI subscription cost, personal AI pricing, no credit card AI',
        ]);
    }

    public function families()
    {
        return view('pages.families', [
            'title'       => 'Family OS — Shared AI Coordination for Every Household',
            'description' => 'HandleLife OS Family OS coordinates schedules, chores, shopping, eldercare, and childcare for up to 5 members. One shared AI brain for the whole household. Free to try.',
            'keywords'    => 'family AI assistant, shared household app, family coordination software, mental load app for parents, eldercare coordination, childcare planner AI, family OS, shared task management',
        ]);
    }

    public function security()
    {
        return view('pages.security', [
            'title'       => 'Privacy & Security — Zero-Knowledge Architecture',
            'description' => 'HandleLife OS uses AES-256 encryption and zero-knowledge architecture. Your data is never sold, never used for AI training, and never visible to us. GDPR, CCPA, and DPDPA compliant.',
            'keywords'    => 'zero knowledge AI privacy, encrypted AI assistant, GDPR compliant AI, AES-256 personal data, private AI no tracking, CCPA AI, secure life app, data sovereignty AI',
        ]);
    }

    public function enterprise()
    {
        return view('pages.enterprise', [
            'title'       => 'Enterprise Solutions — AI Life Coordination at Scale',
            'description' => 'Partner with HandleLife OS to deliver AI-powered life coordination to employees, customers, and communities. Sectors: Workplace, Finance, Health, Education, Eldercare. SSO, global deployment, dedicated support.',
            'keywords'    => 'enterprise AI life management, B2B AI wellness platform, employee mental load AI, white-label AI OS, SSO AI assistant, eldercare AI enterprise, corporate life coordination',
        ]);
    }

    public function about()
    {
        return view('pages.about', [
            'title'       => 'Our Mission — Why We Built HandleLife OS',
            'description' => 'HandleLife OS was built because modern life is overwhelming, not because people are inefficient. We believe every person deserves AI that works for their dignity — not for advertisers. Based in Bangalore, building globally.',
            'keywords'    => 'HandleLife OS mission, why HandleLife OS, AI for dignity, ethical AI assistant, human-centered AI, AI founded in India, life OS philosophy, privacy first company',
        ]);
    }

    public function contact()
    {
        return view('pages.contact', [
            'title'       => 'Contact HandleLife OS — Support, Partnerships & Sales',
            'description' => 'Contact HandleLife OS for partnerships, enterprise demos, press inquiries, or user support. We respond within 1 business day. Based in Bangalore, India. Available worldwide.',
            'keywords'    => 'contact HandleLife OS, AI assistant support, partnership inquiry, enterprise demo, press contact, sales HandleLife',
        ]);
    }

    public function waitlist()
    {
        return view('pages.waitlist', [
            'title'       => 'Join the Waitlist — Free Early Access to HandleLife OS',
            'description' => 'Join 50,000+ people on the HandleLife OS early access waitlist. Free to join. No credit card. Weekly invites. Built for individuals, parents, freelancers, caregivers, and anyone who wants life to feel lighter.',
            'keywords'    => 'HandleLife OS waitlist, AI early access free, join AI life assistant beta, personal AI signup free, life OS waitlist',
        ]);
    }

    public function roadmap()
    {
        return view('pages.roadmap', [
            'title'       => 'Product Roadmap — 10 Phases of HandleLife OS',
            'description' => 'See every phase of HandleLife OS development: from Core AI Assistant (Phase 1) to Memory Engine (Phase 12). We build in public. Check what\'s shipped, what\'s next, and when.',
            'keywords'    => 'HandleLife OS roadmap, AI product phases, personal AI release schedule, public AI roadmap, life OS development timeline',
        ]);
    }

    public function privacy()
    {
        return view('pages.privacy', [
            'title'       => 'Privacy Policy — How HandleLife OS Protects Your Data',
            'description' => 'HandleLife OS privacy policy: zero-knowledge architecture, GDPR/CCPA/DPDPA compliant, data never sold, encrypted at rest. Your life data is yours — we cannot read it.',
            'keywords'    => 'HandleLife OS privacy policy, zero knowledge data policy, GDPR AI compliance, CCPA data rights, data protection AI',
            'robots'      => 'index, follow, max-snippet:0',
        ]);
    }

    public function terms()
    {
        return view('pages.terms', [
            'title'       => 'Terms of Service — HandleLife OS User Agreement',
            'description' => 'HandleLife OS terms of service: clear, fair, written in plain language. Covers acceptable use, subscriptions, data ownership, and your rights. Last updated April 2026.',
            'keywords'    => 'HandleLife OS terms of service, AI app user agreement, data ownership terms, subscription terms AI',
            'robots'      => 'index, follow, max-snippet:0',
        ]);
    }
}
