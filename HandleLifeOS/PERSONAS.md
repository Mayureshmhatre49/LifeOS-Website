# Life OS — E2E Test Personas

41 hand-crafted test personas covering a global cross-section of users.
Each persona is seeded with realistic, culturally-authentic data across all relevant Life OS modules.

Seed scripts live in `tests/e2e-personas/`. All accounts use password `E2eTest123!`.
Email domain: `@e2e-test.handlelifeos.app`

---

## Quick Reference

| # | ID | Name | Age | Country | Currency | Occupation | Key Modules | Notes |
|---|----|----|-----|---------|----------|-----------|------------|-------|
| 1 | priya | Priya Sharma | 29 | India | INR | Software Engineer | Money, Career, Investments | Vegetarian, lactose-intolerant |
| 2 | james | James Mitchell | 45 | UK | GBP | Lawyer | Legal, Family, Vault | Married, 2 kids |
| 3 | fatima | Fatima Al-Rashid | 38 | UAE | AED | Healthcare Consultant | Career, Network, Mind | Divorced, RTL Arabic, halal |
| 4 | carlos | Carlos Rodriguez | 58 | Mexico | MXN | Restaurant Owner | Business, Money, Legal | Married, family business |
| 5 | yuki | Yuki Tanaka | 26 | Japan | JPY | UX Designer | Focus, Habits, Mind | Single, tiny apartment |
| 6 | sarah | Sarah Johnson | 35 | USA | USD | Product Manager | Planner, Money, Investments | Vegan, gluten-free |
| 7 | abdullah | Abdullah Khan | 42 | Pakistan | PKR | Textile Exporter | Business, Family, AURA | 4 kids, RTL Urdu, halal |
| 8 | emma | Emma Wilson | 22 | Australia | AUD | Student/Barista | Habits, Mind, Career | Eating disorder recovery |
| 9 | rajesh | Rajesh Patel | 71 | India | INR | Retired Bank Manager | Mind, Vault, Home | Widower, diabetic, accessibility |
| 10 | nina | Nina Okonkwo | 31 | Nigeria | NGN | Freelance Journalist | Money, AURA, Career | Single mother |
| 11 | amara | Amara Diallo | 34 | Senegal | XOF | NGO Director | Career, Network, Community | French/Wolof, halal, single |
| 12 | hiroshi | Hiroshi Nakamura | 52 | Japan | JPY | Corporate Executive | Investments, Money, Travel | Married, high earner |
| 13 | sofia | Sofia Andersen | 27 | Denmark | DKK | Environmental Scientist | Habits, Mind, Nutrition | Vegan, ethical investor |
| 14 | mohamed | Mohamed Hassan | 44 | Egypt | EGP | Civil Engineer | Money, Home, Family | RTL Arabic, married+3 kids |
| 15 | grace | Grace Kim | 30 | South Korea | KRW | Beauty Startup CEO | Business, Career, Investments | Series A founder, single |
| 16 | dmitri | Dmitri Volkov | 38 | UAE | AED | Tech Entrepreneur | Investments, Business, Travel | Dubai-based, crypto, married |
| 17 | isabel | Isabel Ferreira | 25 | Brazil | BRL | Social Media Creator | Money, Career, Habits | Irregular income, student debt |
| 18 | kofi | Kofi Mensah | 40 | Ghana | GHS | Teacher & Smallholder | Money, Family, Home | 4 kids, dual income, mobile-first |
| 19 | lena | Lena Mueller | 47 | Germany | EUR | Financial Advisor | Investments, Business, Legal | Married+2 kids, IFA sole trader |
| 20 | arjun | Arjun Nair | 33 | Singapore | SGD | Fintech Founder | Business, Investments, Focus | Series A startup, vegetarian |
| 21 | mei | Mei Chen | 29 | UK | GBP | PhD Researcher | Money, Habits, Focus | Chinese student, stipend income |
| 22 | omar_m | Omar Al-Mansouri | 56 | Morocco | MAD | Hotel Owner | Business, Travel, Money | French speaker, halal, seasonal |
| 23 | maria | Maria Santos | 36 | Saudi Arabia | SAR | OFW Nurse | Money, Family, Mind | OFW remittances, Catholic |
| 24 | robert | Robert Williams | 65 | USA | USD | Retired Military | Mind, Home, Investments | Widower, PTSD-aware, veteran |
| 25 | kavya | Kavya Reddy | 22 | India | INR | Engineering Student | Career, Money, Habits | First-gen, scholarship, Telugu |
| 26 | tunde | Tunde Adeyemi | 41 | UK | GBP | Investment Banker | Investments, Career, Family | Nigerian heritage, VP Barclays |
| 27 | leila | Leila Ahmadi | 32 | Germany | EUR | Architect | Career, Home, Mind | Iranian immigrant, Berlin |
| 28 | patrick | Patrick O'Brien | 55 | Ireland | EUR | Pub Owner | Business, Money, Legal | 3rd-gen family pub, 3 kids |
| 29 | amelia | Amelia Roberts | 42 | USA | USD | Teacher | Money, Family, Mind | Single mother, ADHD, 2 kids |
| 30 | ravi | Ravi Krishnan | 48 | Sri Lanka | LKR | IT Consultant (Remote) | Money, Investments, Career | USD remote, LKR savings |
| 31 | zainab | Zainab Al-Saeedi | 26 | Saudi Arabia | SAR | Fashion Influencer | Business, Career, Investments | RTL Arabic, Vision 2030 |
| 32 | pierre | Pierre Dubois | 61 | France | EUR | Vineyard Owner | Business, Home, Legal | Estate planning, agri-business |
| 33 | aisha | Aisha Mwangi | 29 | Kenya | KES | FinTech Founder | Business, Career, Network | Seed stage, M-Pesa native |
| 34 | lucas | Lucas Oliveira | 37 | Brazil | BRL | Esports Creator | Money, Career, Focus | Streaming income, night owl |
| 35 | nadia | Nadia Kovacs | 44 | Hungary | HUF | Psychotherapist | Mind, Business, Career | Divorced, private practice |
| 36 | rahul | Rahul Mehta | 19 | India | INR | Engineering Student | Money, Habits, Focus | First-year, hostel, pocket money |
| 37 | ana | Ana González | 50 | Chile | CLP | Food Blogger/Author | Business, Nutrition, Career | 500k blog followers, cookbook |
| 38 | ivan | Ivan Marchenko | 35 | Poland | PLN | IT Freelancer | Money, Career, Mind | War-displaced Ukrainian |
| 39 | hana_y | Hana Yamamoto | 68 | Japan | JPY | Retired Teacher | Mind, Home, Vault | Widowed, accessibility, tech-novice |
| 40 | michael | Michael Osei | 31 | Ghana | GHS | Football Coach & Founder | Career, Business, Community | Youth academy, social impact |
| 41 | preethi | Preethi Kumar | 38 | India | INR | EdTech Startup Founder | Business, Career, Family | Ex-homemaker, Tamil, 2 kids |

---

## Detailed Profiles

### 1. Priya Sharma (`priya`)
**38yo → 29yo · Bangalore, India · INR**

Software engineer at a Bangalore fintech startup. Second job out of college; recently promoted to senior level. Lives alone in a Koramangala flat. Uses the app primarily for financial planning and career growth.

- **Financial snapshot:** ₹1,40,000/month take-home. SIP investments into ELSS and index funds. Emergency fund building (target: 6 months expenses).
- **Dietary:** Vegetarian, lactose-intolerant. Follows South Indian home cooking.
- **Habits:** 5am wake-ups on work days, daily 30-min walk, weekend cooking batch sessions.
- **Personality:** Analytical and self-driven. Sets weekly goals. Prefers bullet-point AI responses.
- **Modules:** Money (SIPs, budget), Investments (index funds, ELSS), Career (skill laddering), Habits, Mind.

---

### 2. James Mitchell (`james`)
**45yo · London, UK · GBP**

Senior partner at a mid-size law firm specialising in commercial property. Married to Claire; two kids (Oliver 8, Sophie 5). Commutes Guildford–London 4 days a week.

- **Financial snapshot:** £120,000/year salary + bonus. Mortgage (£2,800/month), school fees (£1,400/month), ISA investments.
- **Modules:** Legal (UK contract reviews, GDPR), Family (shared tasks, school calendar), Vault (documents, deeds, wills), Briefing, Travel (family holidays).
- **Notes:** Comfortable with technology. Appreciates formal, structured AI responses. Will benefit from legal deadline tracking and document summarisation.

---

### 3. Fatima Al-Rashid (`fatima`)
**38yo · Dubai, UAE · AED · Arabic (RTL)**

Senior healthcare consultant at Mediclinic Middle East. Divorced; three children (Layla 9, Omar 5, Yaseen 16). Running a growing independent consultancy (AlRashid Health Advisory) alongside her day job.

- **Financial snapshot:** AED 28,000 salary + AED 3–5k consulting income. Car loan + apartment lease. Investments in Sukuk and gold.
- **Seed files:** 8 domain-specific files — money, family, mind/nutrition, career/network, business/home/travel, protection/legal, habits/memory/focus/decisions.
- **Unique aspects:** RTL layout, halal dietary constraints, Dubai-specific services (DEWA, Etisalat, RTA).
- **Reference persona:** Most extensively seeded — used as the template for all other personas.

---

### 4. Carlos Rodriguez (`carlos`)
**58yo · Mexico City, Mexico · MXN**

Owner of a family restaurant chain (3 locations) in Mexico City. Married to Rosa for 32 years; children are adults and involved in the business. Business has recovered post-COVID.

- **Financial snapshot:** MXN 180,000/month in restaurant revenue. Business loans, staff payroll, supplier relationships.
- **Business focus:** Client CRM (suppliers/corporate clients), invoicing, P&L dashboard, legal compliance (SAT tax filings).
- **Dietary:** No restrictions personally; restaurant serves traditional Mexican cuisine.
- **Notes:** Less tech-savvy. Prefers simple explanations. Speaks Spanish primarily.

---

### 5. Yuki Tanaka (`yuki`)
**26yo · Tokyo, Japan · JPY**

UX designer at a mid-size product studio in Shibuya. Single, lives in a 1K apartment (25 sqm) in Shinjuku. Introvert who carefully manages energy and schedules.

- **Financial snapshot:** ¥3,800,000/year. Minimal rent (¥85,000/month), frugal lifestyle. Small investment in NISA (Japan's ISA equivalent).
- **Focus habits:** Pomodoro devotee. 2h deep work blocks. Tracks focus streaks.
- **Dietary:** Pescatarian. Cooks Japanese home food most nights.
- **Notes:** Values clean, minimal UI. Quiet mode preferred. Uses the app for focus sessions, daily planner, and habit tracking above all else.

---

### 6. Sarah Johnson (`sarah`)
**35yo · San Francisco, USA · USD**

Senior Product Manager at a Series B SaaS company. Married to Tyler (software engineer). Planning to adopt a child. Health-conscious and organised.

- **Financial snapshot:** $180,000/year base + RSUs. Bay Area mortgage ($4,500/month PITA), maxing out 401k, brokerage index funds.
- **Dietary:** Vegan, gluten-free.
- **Modules:** Planner (sprint-style weekly planning), Briefing (morning digest), Money, Nutrition (macro tracking), Career, Investments.
- **Notes:** Power user. Expects sophisticated AI responses. Early adopter.

---

### 7. Abdullah Khan (`abdullah`)
**42yo · Karachi, Pakistan · PKR · Urdu (RTL)**

Owner of a textile export business (Khan Fabrics). Married to Sana; four children (Zara 4, Bilal 9, Fateh 12, Sara 16). Business exports to UK, Turkey, and UAE.

- **Financial snapshot:** PKR 800,000–1,200,000/month business income (variable). Real estate investments. Business accounts in USD.
- **Unique aspects:** RTL Urdu locale. Ramadan-aware scheduling. Halal financial products. B2B invoicing.
- **Modules:** Business (B2B clients, invoices), Family (large household, school schedules), AURA (youngest child Zara), Vault, Legal.

---

### 8. Emma Wilson (`emma`)
**22yo · Sydney, Australia · AUD**

Second-year nursing student at UNSW. Works 3 shifts/week as a barista to cover expenses. In recovery from an eating disorder. Uses the app for mental health journaling and financial tracking.

- **Financial snapshot:** AUD 1,800/month (barista + Centrelink). Rent AUD 900/month (shared house). Budget very tight.
- **Sensitivity:** Eating disorder recovery — app should not display calorie counts unprompted or use weight-related language.
- **Modules:** Habits (recovery-positive), Mind (journal, mood logs), Career (study + part-time balance), Money.
- **Notes:** Key accessibility persona for mental health content sensitivity.

---

### 9. Rajesh Patel (`rajesh`)
**71yo · Ahmedabad, India · INR · Gujarati (gu-IN)**

Retired bank manager. Widower (wife passed 2022). Two adult children in the US and Canada. Manages his own finances and health independently. Diabetic — careful about diet.

- **Financial snapshot:** INR 45,000/month pension + FD interest. Manages fixed deposits and PPF accounts. No equity investments.
- **Accessibility:** Large text, high contrast, voice input. Tech-novice — needs simple navigation cues.
- **Dietary:** Diabetic-friendly. Gujarati vegetarian diet.
- **Modules:** Mind (grief journal, wellness), Vault (will, medical documents), Network (staying connected with children), Home (property maintenance).

---

### 10. Nina Okonkwo (`nina`)
**31yo · Lagos, Nigeria · NGN**

Freelance investigative journalist. Single mother to Adaeze (6). Works for multiple Nigerian and international publications. Also runs a small media consultancy for NGOs.

- **Financial snapshot:** NGN 800,000–2,000,000/month (highly variable). Irregular payments. Saving for Adaeze's private school.
- **Modules:** Money (irregular income budgeting), AURA (Adaeze development), Family, Capture (voice notes for stories), Briefing, Career.
- **Notes:** Mobile-first user. Reliable mobile data is inconsistent — values offline functionality. High Energy user.

---

### 11. Amara Diallo (`amara`)
**34yo · Dakar, Senegal · XOF · French**

Director of an education NGO (EduSenegal) operating in 3 regions of Senegal. Single, lives in the Plateau neighbourhood. Speaks Wolof, French, and basic English. Manages a team of 22 staff and coordinates international donor relationships.

- **Financial snapshot:** XOF 1,800,000/month salary (NGO) + freelance training facilitation income. Low personal expenses; high professional travel budget.
- **Religion:** Muslim (moderate). Halal dietary needs. Ramadan-conscious scheduling.
- **Career:** Built EduSenegal from 5 to 22 staff over 4 years. Pursuing INSEAD Social Entrepreneurship alumni status.
- **Network:** Dense — UN agency contacts, local government, international foundations.
- **Modules:** Career (NGO leadership, grant management), Network (donor CRM), Community (community challenges), Briefing (daily digest of project KPIs), Money.

---

### 12. Hiroshi Nakamura (`hiroshi`)
**52yo · Tokyo, Japan · JPY**

VP of Operations at a large electronics conglomerate (3,000+ employees). Married to Keiko; one son Kenji (17, planning university). Works long hours typical of Japanese corporate culture. Highly organised and data-driven.

- **Financial snapshot:** ¥18,000,000/year salary. Investment portfolio: JPY 45M in Japanese equities, US ETFs, and corporate bonds. Pension via company and iDeCo.
- **Travel:** Business travel 8–10 trips/year (Asia-Pacific, occasional Europe).
- **Focus:** Deep work habit — blocks 6am–8am daily before office. Uses focus mode for strategic thinking.
- **Legal:** Estate planning, company stock option tax.
- **Modules:** Investments (large portfolio), Money (high earner tracking), Focus (deep work sessions), Legal (estate + tax), Travel (frequent business trips).

---

### 13. Sofia Andersen (`sofia`)
**27yo · Copenhagen, Denmark · DKK**

Environmental scientist at the Danish Environmental Protection Agency. Single, rents a flat in Nørrebro. Cycles everywhere. Committed to sustainable living — tracks her carbon footprint alongside finances.

- **Financial snapshot:** DKK 42,000/month gross (DKK 28,000 net). Student loan (DKK 85,000 remaining). Ethical ESG index funds. Emergency fund at 3 months.
- **Dietary:** Vegan. Home cooks 90% of meals. Plant-based meal planning.
- **Habits:** Daily cycling commute, weekly yoga, zero-waste meal prep.
- **Ethical investing:** Only green bonds and ESG-screened funds.
- **Modules:** Habits (sustainability tracking), Mind (journaling, anxiety management), Career (research publications, academic networking), Nutrition (vegan meal planning), Investments (ethical funds).

---

### 14. Mohamed Hassan (`mohamed`)
**44yo · Cairo, Egypt · EGP · Arabic (RTL)**

Senior civil engineer at a mid-size construction consultancy. Married to Heba; three children (Youssef 7, Nour 11, Omar 14). Owns an apartment in New Cairo (mortgage). Car loan for a Hyundai Tucson.

- **Financial snapshot:** EGP 45,000/month salary + occasional project bonuses. Apartment mortgage (EGP 12,000/month), car loan (EGP 4,500/month). Inflation impacts daily.
- **RTL locale:** Arabic UI. Currency devaluation context (EGP to USD).
- **Family:** School fees for 3 children. Extended family obligations (parents' medical expenses).
- **Legal:** Egyptian labour law awareness. Property registration compliance.
- **Modules:** Money (budget, loans), Home (apartment, car maintenance), Family (3 kids' schedules), Career (engineer licensing, professional development), Legal (property, tax).

---

### 15. Grace Kim (`grace`)
**30yo · Seoul, South Korea · KRW**

CEO and founder of GLOW Lab, a Korean beauty DTC brand with 8 employees. Raised Series A (KRW 5B = ~$3.8M USD). Single; puts 80% of her time into the business.

- **Financial snapshot:** KRW 7,000,000/month founder salary (self-imposed cap). Business runway: 18 months. Personal savings minimal during growth phase.
- **Business:** B2C product business — Shopify store, retail partnerships (CJ Olive Young), export to Southeast Asia.
- **Network:** Investors, K-beauty influencers, beauty industry contacts.
- **Career:** Young CEO navigating Korean corporate culture as a female founder.
- **Modules:** Business (P&L, investor reporting), Career (leadership, board management), Network (investor CRM, partnership leads), Investments (personal financial planning post-Series A), Community (beauty community challenges).

---

### 16. Dmitri Volkov (`dmitri`)
**38yo · Dubai, UAE · AED**

Russian-born tech entrepreneur. Founded a B2B SaaS company (CloudOps ME) focused on Gulf enterprise clients. Moved to Dubai in 2020. Married to Anya; no children yet. Holds cryptocurrency alongside traditional investments.

- **Financial snapshot:** AED 55,000/month founder salary. CloudOps ME generating AED 2M ARR. Personal crypto portfolio ~AED 400,000. UAE golden visa holder.
- **Investments:** Mix of crypto (BTC, ETH), US tech stocks, Dubai real estate (1 investment property).
- **Protection:** Very active scam checker user — high phishing risk in crypto space.
- **Travel:** Dubai hub, frequent travel to Riyadh, Doha, and London for enterprise sales.
- **Modules:** Investments (crypto + traditional), Business (SaaS P&L, client management), Money, Protection (crypto scam awareness), Travel.

---

### 17. Isabel Ferreira (`isabel`)
**25yo · São Paulo, Brazil · BRL**

Instagram and TikTok content creator (lifestyle, fashion, beauty). 280,000 followers combined. Lives alone in a studio apartment in Vila Madalena. Income is irregular — brand deals range from BRL 2,000 to BRL 15,000/deal.

- **Financial snapshot:** BRL 4,000–18,000/month (highly variable). Student loan (BRL 28,000 remaining, from journalism degree she didn't complete). Rent BRL 2,800/month. No savings yet.
- **Goals:** Build a 3-month emergency fund. Grow to 500k followers for tier-2 brand deals.
- **Habits:** Erratic sleep (content creation runs late). Trying to implement a morning routine.
- **Business:** Solo content creator — manages her own contracts, invoicing, income tax (MEI regime).
- **Modules:** Money (irregular income tracking, emergency fund), Career (influencer growth, brand partnerships), Habits (sleep & routine), Mind (anxiety about income instability), Capture (content ideas).

---

### 18. Kofi Mensah (`kofi`)
**40yo · Kumasi, Ghana · GHS**

Secondary school physics teacher (government school) and weekend smallholder farmer on a 2-acre plot outside Kumasi. Married to Abena; four children (Akosua 9, Kwame 12, Ama 15, Nana 18). Mobile-first user on Android.

- **Financial snapshot:** GHS 3,800/month teaching salary + GHS 1,200–2,400/month farming income (seasonal). Mobile money (MTN MoMo) primary banking. Small susu savings group.
- **Family:** Oldest child Nana starting university — planning fees. Children's school schedules across 3 schools.
- **Home:** Owns a concrete block family home. Generator maintenance, borehole water system.
- **Community:** Active in church susu group and community development association.
- **Modules:** Money (dual income tracking, education savings), Family (4 kids' schedules, school fees), Home (property, generator, farming assets), Community (susu group challenges), Habits (prayer, farming routines).

---

### 19. Lena Mueller (`lena`)
**47yo · Munich, Germany · EUR**

Independent financial advisor (IFA) operating as a sole trader. Married to Klaus (civil engineer); two daughters (Mia 11, Hannah 7). Advises individual clients on pension planning, investments, and insurance.

- **Financial snapshot:** EUR 9,500/month business income (25 active clients). Pension (bAV company + Riester). House mortgage (EUR 1,400/month). ISA-equivalent (Depot) investments.
- **Business:** Client CRM for 25 financial advisory clients. Invoice management. Regulatory compliance (BaFin registration).
- **Legal:** GDPR compliance, BaFin regulatory filings, client contract management.
- **Investments:** Highly sophisticated — ETF portfolios, real estate, gold, bonds.
- **Modules:** Investments (personal + advising context), Money (household + business), Business (client management, invoicing), Legal (BaFin, GDPR, tax), Family (family schedules, school).

---

### 20. Arjun Nair (`arjun`)
**33yo · Singapore · SGD**

Founder and CEO of PaySwift (B2B payments fintech), Series A funded (SGD 8M). Originally from Kerala, educated at NTU Singapore. Single, lives in a Tanjong Pagar condo.

- **Financial snapshot:** SGD 12,000/month founder salary. Personal investments: SGD 200,000 in US ETFs + startup stock. Company runway: 14 months.
- **Work rhythm:** 12-hour days typical. Deep work sessions 6am–8am before team standups. Weekend recovery essential.
- **Network:** VC contacts, MAS (Monetary Authority of Singapore) fintech connections, Southeast Asia banking CXOs.
- **Career goals:** Series B raise by Q4 2026. Expand to Malaysia and Indonesia.
- **Modules:** Business (startup KPIs, investor updates), Investments (personal portfolio), Career (founder growth, Series B prep), Network (investor CRM), Focus (intense work sessions).

---

### 21. Mei Chen (`mei`)
**29yo · Edinburgh, UK · GBP**

Third-year PhD candidate in Computational Biology at the University of Edinburgh. Born in Wuhan. Living on a stipend. Homesick; returns to China once a year.

- **Financial snapshot:** GBP 1,500/month stipend (just covers rent + food). No savings. Chinese family sends GBP 200–500/month for emergencies. Credit card debt GBP 800.
- **Habits:** Rigid study schedule. Pomodoro technique. Daily mandarin journaling.
- **Career:** Academic track — thesis due 2026, post-doc applications in UK and Singapore.
- **Mind:** Moderate anxiety and isolation. Journaling helps significantly.
- **Modules:** Money (survival budgeting, debt tracking), Habits (study schedule), Focus (PhD writing sessions), Career (academic publications, job applications), Mind (anxiety, homesickness journaling).

---

### 22. Omar Al-Mansouri (`omar_m`)
**56yo · Marrakech, Morocco · MAD · French**

Owner of Riad Al Waha (boutique hotel, 12 rooms) and a small tourism agency (Sahara Adventure Tours). Married to Fatima; two adult children. Business is seasonal — peak Oct–April.

- **Financial snapshot:** MAD 80,000–250,000/month (highly seasonal). Business loans for riad renovation. Income in EUR (from European guests) and MAD.
- **Business:** Hotel + tourism agency P&L. Client bookings, supplier management, staff payroll (12 employees).
- **Legal:** Tourism licence compliance, VAT, property registration.
- **Travel:** Trade fairs (ITB Berlin, WTM London), supplier visits.
- **Modules:** Business (dual business management), Network (European tour operator contacts, travel agents), Money (seasonal cash flow), Travel (international trade fair trips), Legal (Moroccan tourism compliance).

---

### 23. Maria Santos (`maria`)
**36yo · Jeddah, Saudi Arabia · SAR (OFW from Philippines)**

Registered nurse working in a private hospital in Jeddah. Originally from Manila. Husband Rolando stays in Manila with their two children (Gio 8, Lea 5). Sends monthly remittances.

- **Financial snapshot:** SAR 4,500/month salary. Sends PHP 25,000–30,000 monthly to Manila. Personal expenses minimal (shared nurse accommodation, hospital canteen). Saves SAR 500–800/month.
- **Family:** Separated from family. FaceTime daily. Children's school fees managed remotely.
- **Mind:** Loneliness and caregiver burden. Stress from working night shifts. Catholic faith practices.
- **Vault:** OEC (overseas employment certificate), nursing licence, work permit, insurance documents.
- **Modules:** Money (SAR budget + PHP remittance tracking), Family (remote parenting, children's schedules), Mind (loneliness journal, Catholic reflections), Vault (OFW documents), Network (Filipino nurse community in Jeddah).

---

### 24. Robert Williams (`robert`)
**65yo · Virginia Beach, USA · USD**

Retired US Army Lieutenant Colonel (25 years service). Widower — wife Patricia passed 2021 from cancer. Two adult children, 4 grandchildren. Receiving military pension + VA benefits.

- **Financial snapshot:** $6,800/month (pension + VA disability). Home paid off. Investment portfolio $280,000 (Vanguard TSP). Medicare + Tricare health coverage.
- **Mind:** Processing grief and transition to civilian life. Some PTSD symptoms. Therapy twice monthly.
- **Home:** Single-story home in Virginia Beach. Age-in-place modifications in progress (ramp, grab bars).
- **Vault:** DD-214, will, medical POA, VA benefits documents.
- **Accessibility:** Large text preference. Straightforward language — no jargon. Voice note preference.
- **Modules:** Mind (grief, PTSD journaling), Home (age-in-place modifications, property maintenance), Vault (military documents, estate planning), Investments (retirement drawdown), Legal (will, beneficiary updates).

---

### 25. Kavya Reddy (`kavya`)
**22yo · Hyderabad, India · INR**

First-generation college student — engineering student (Computer Science) at BITS Pilani Hyderabad. Parents are government school teachers in a small Telangana town. On a merit scholarship. Lives in college hostel.

- **Financial snapshot:** INR 8,000/month scholarship + INR 3,000 from parents. Hostel and mess fees covered by college. Zero savings. Uses UPI (PhonePe/GPay) exclusively.
- **Goals:** FAANG internship, then full-time job — first person in family to work in tech.
- **Habits:** 5am study sessions before class. 6 hours deep work daily. CGPA maintenance.
- **Career:** Resume building, competitive programming, internship applications.
- **Community:** Women in Tech college chapter co-founder.
- **Modules:** Career (skill building, internship apps), Money (survival budget), Habits (study discipline), Mind (academic pressure, imposter syndrome), Community (WiT club challenges).

---

### 26. Tunde Adeyemi (`tunde`)
**41yo · London, UK · GBP**

VP at Barclays Investment Bank (mergers & acquisitions). Originally from Lagos, moved to London for university (LSE Economics). Married to Funke (HR Director); two kids (Dami 5, Tobi 8). Sends money to family in Nigeria monthly.

- **Financial snapshot:** £185,000/year base + bonus (£60,000–120,000). Mortgage £3,200/month. Maxing ISA. Investment portfolio £380,000 (UK equities, US ETFs, Nigerian Eurobonds). Remittances NGN 300,000/month to Nigeria.
- **Network:** Banking network (Goldman, JPMorgan, KPMG contacts), Nigerian diaspora professionals, Lagos Angel investor network.
- **Family:** School runs, AURA for Dami, Nigerian cultural traditions maintained.
- **Modules:** Investments (large diversified portfolio), Money (high earner, Nigeria remittance), Career (VP track to Managing Director), Network (banking + Nigerian diaspora CRM), Family (2 kids, cultural balance).

---

### 27. Leila Ahmadi (`leila`)
**32yo · Berlin, Germany · EUR**

Architect at a mid-size Berlin architecture firm. Originally from Isfahan, Iran. Came to Germany for a Master's degree in 2018 and stayed. Single; navigating German bureaucracy and immigration paperwork. Speaks Farsi and German fluently.

- **Financial snapshot:** EUR 4,800/month gross (EUR 2,950 net). Rent EUR 1,100/month (Prenzlauer Berg). Savings EUR 12,000. No debt. Sends EUR 200–300/month to family in Iran.
- **Career:** Senior architect, aiming for project lead. Wants to eventually open her own studio.
- **Home:** Rental apartment — landlord negotiations, Nebenkosten (utility cost declarations).
- **Legal:** Residence permit renewal, work visa compliance, German tax returns (Steuererklärung).
- **Mind:** Immigrant identity, belonging, family separation.
- **Modules:** Career (architectural portfolio, project leadership), Home (rental management, German tenancy law), Mind (immigrant identity journaling), Legal (Aufenthaltserlaubnis, tax), Vault (immigration documents, visa).

---

### 28. Patrick O'Brien (`patrick`)
**55yo · Galway, Ireland · EUR**

Third-generation owner of O'Brien's Bar and Restaurant in Galway's Latin Quarter. Married to Sinéad; three children (Ciarán 15, Fionnuala 19, Séan 23). Fionnuala and Séan involved in the business.

- **Financial snapshot:** EUR 12,000–45,000/month (highly seasonal — peak summer). Business loans (post-COVID relief loan still being repaid). Home mortgage EUR 800/month (nearly paid off).
- **Business:** Pub + restaurant P&L. Staff payroll (18 employees in peak season). Supplier management. Live music licensing.
- **Legal:** Irish Revenue Compliance, liquor licence renewal, food safety certification (FSAI).
- **Network:** Galway hospitality contacts, food & drink suppliers, Irish Tourism bodies.
- **Modules:** Business (seasonal cash flow, staff costs, invoicing), Money (household + business), Legal (liquor licence, tax compliance), Home (family property maintenance), Network (supplier and tourism CRM).

---

### 29. Amelia Roberts (`amelia`)
**42yo · Denver, USA · USD**

Middle school English teacher at a Denver public school. Divorced (2021); two daughters (Ella 10, Maya 13). Has ADHD (diagnosed in 2019). Manages everything solo — parenting, finances, house.

- **Financial snapshot:** $62,000/year salary. Child support $800/month. Mortgage $1,600/month (paid by support + her income). Tight budget — no savings beyond $2,000 emergency fund.
- **ADHD:** Benefits from structured task management, reminders, and simple UI. Needs non-overwhelming information density.
- **Mind:** Therapy fortnightly. Journaling for emotional processing. Divorce recovery.
- **Family:** AURA for Maya (mild dyslexia). Ella's school schedule + activities.
- **Community:** Joins teacher financial wellness challenges and ADHD parent community.
- **Modules:** Money (tight budget, child support tracking), Family (2 daughters, school calendars), Mind (ADHD management, divorce journaling), Habits (ADHD routine building), Community (teacher wellness challenges).

---

### 30. Ravi Krishnan (`ravi`)
**48yo · Colombo, Sri Lanka · LKR**

Senior IT consultant working remotely for a Singapore-based company (billed in USD). Married to Priya; son Dinesh (12). Navigating Sri Lanka's economic recovery — high inflation, currency depreciation.

- **Financial snapshot:** USD 4,500/month income. Converts to LKR at market rate (LKR 1.35M/month). Mortgage LKR 85,000/month. USD savings account (SG bank): $18,000. LKR investments in government bonds.
- **Economic context:** Sri Lanka 2022–2026 economic crisis — inflation 30%+. Electricity outages. USD income is a lifeline but FX conversion anxiety.
- **Career:** Exploring remote roles in UAE or Singapore for relocation.
- **Investments:** Diversifying out of LKR into USD and SGD assets.
- **Modules:** Money (USD→LKR conversion, inflation budgeting), Investments (diversification strategy), Career (relocation research, remote consulting), Home (home maintenance amid utility crises), Family (Dinesh's education, family security).

---

### 31. Zainab Al-Saeedi (`zainab`)
**26yo · Riyadh, Saudi Arabia · SAR · Arabic (RTL)**

Fashion content creator and brand consultant. 800,000 Instagram followers, 450,000 TikTok. Signs 6–10 brand deals per month. Beneficiary of Saudi Vision 2030 social liberalisation. Single; lives with family.

- **Financial snapshot:** SAR 35,000–80,000/month (highly variable brand deal income). Personal expenses low (family home). Investing SAR 15,000/month in Tadawul stocks and Amanah mutual funds.
- **Business:** Solo creator + brand consultancy (Al-Saeedi Creative). Manages contracts, deliverables, and invoicing.
- **Legal:** Saudi commercial registration, VAT compliance for creator income.
- **RTL locale:** Arabic UI. Saudi cultural context — modesty-aligned brand deals, Vision 2030 themes.
- **Modules:** Business (brand deal contracts, invoicing), Career (creator growth, brand partnerships), Money (variable income budgeting), Investments (Tadawul, Amanah), Vault (contract archive).

---

### 32. Pierre Dubois (`pierre`)
**61yo · Bordeaux, France · EUR**

Fifth-generation owner of Château Dubois, a 40-hectare Bordeaux vineyard producing 150,000 bottles/year. Married to Marie-Claire (60). One son Étienne (32) who manages exports. Planning for succession.

- **Financial snapshot:** EUR 25,000–80,000/month (vintage-dependent). Property worth EUR 4M+. Business loans EUR 1.2M (vineyard expansion 2019). Investment portfolio EUR 600,000.
- **Business:** Winery P&L, export invoice management (UK, US, Japan, China clients), staff payroll (12 permanent + seasonal harvest).
- **Legal:** French succession law, estate planning, AOC (Appellation d'Origine Contrôlée) compliance.
- **Home:** Château property and multiple outbuildings. Regular major maintenance.
- **Modules:** Business (winery management, export invoicing), Home (château maintenance), Legal (succession, AOC compliance, estate planning), Investments (wealth management pre-succession), Travel (wine fair trips — Vinexpo, ProWein).

---

### 33. Aisha Mwangi (`aisha`)
**29yo · Nairobi, Kenya · KES**

Founder and CEO of PesaFlow, a mobile-money aggregation startup (seed stage, $500,000 raised). Single, lives in Westlands. M-Pesa power user. Grew up in Kibera.

- **Financial snapshot:** KES 180,000/month founder salary. Personal savings KES 400,000 (M-Pesa savings wallet + Co-op Bank). USD 12,000 in a Silicon Savannah VC-recommended US account.
- **Business:** PesaFlow — B2B API for businesses to integrate M-Pesa, Airtel Money. 12 pilot clients. Series A prep.
- **Network:** Nairobi tech ecosystem (iHub, Strathmore University), East Africa VC contacts, Safaricom partnership contacts.
- **Career goals:** Series A by Q3 2026. Hire 5 engineers.
- **Modules:** Business (startup KPIs, client management, investor prep), Career (founder skills, leadership), Network (ecosystem CRM), Money (personal budget, USD savings), Investments (personal wealth building).

---

### 34. Lucas Oliveira (`lucas`)
**37yo · Belo Horizonte, Brazil · BRL**

Professional Valorant player turned Twitch streamer and esports content creator. 320,000 Twitch followers, YouTube 180,000 subscribers. Married to Fernanda (elementary school teacher). Lives a night-owl schedule — streams 9pm–2am.

- **Financial snapshot:** BRL 18,000–35,000/month (Twitch subs + donations + sponsor deals + YouTube AdSense). Irregular but growing. Owns apartment (mortgage BRL 3,200/month).
- **Schedule:** Streams 5 nights/week. Morning dedicated to content creation and business admin.
- **Business:** Own-brand merchandise (Lucas GG Store), esports coaching, sponsorship contract management.
- **Habits:** Night-owl schedule makes conventional habit frameworks challenging — adapted wake times.
- **Focus:** Long creative sessions. Pomodoro adapted for streaming prep.
- **Modules:** Money (irregular streaming income), Career (esports career development, brand growth), Habits (night-owl adapted routines), Focus (streaming prep sessions), Community (gaming community challenges, Twitch events).

---

### 35. Nadia Kovacs (`nadia`)
**44yo · Budapest, Hungary · HUF**

Licensed psychotherapist with a private practice (20 clients/week). Divorced from Balázs (2020); one son Bence (8, shared custody). Fluent Hungarian, English, and German. EU healthcare regulations-aware.

- **Financial snapshot:** HUF 1,800,000/month gross (EUR ~4,500 equivalent). Practice costs (rental, supervision, insurance) ~HUF 400,000/month. Mortgage HUF 180,000/month. Savings in EUR (HUF inflation concern).
- **Business:** Private practice management — session scheduling, billing (insurance + private pay), compliance.
- **Mind:** Practices what she teaches — journaling, mindfulness, regular supervision.
- **Career:** Pursuing professional accreditation in Somatic Therapy. Considering group practice expansion.
- **Legal:** GDPR for therapy records, EU healthcare professional standards, Hungarian tax.
- **Modules:** Mind (personal wellbeing, supervision journaling), Business (practice management, client billing), Career (professional development, somatic therapy training), Money (HUF vs EUR savings strategy), Network (professional network — supervisors, referral GPs).

---

### 36. Rahul Mehta (`rahul`)
**19yo · Pune, India · INR**

First-year Computer Science student at Symbiosis Institute, Pune. From a small town in Rajasthan. Living in hostel. Gets INR 5,000/month pocket money from parents + earns INR 2,000–4,000 tutoring juniors. Hindi speaker.

- **Financial snapshot:** INR 7,000–9,000/month total. Hostel and mess fees paid by parents. Tracks every rupee on spreadsheet (switching to the app). Zero savings so far.
- **Goals:** Summer internship at a startup. Build a competitive programming profile (Codeforces rating 1800+). Save INR 20,000 for laptop upgrade.
- **Habits:** 6am wake-up, competitive programming 2h daily, weekend DSA practice.
- **Social:** Active in college coding club and hackathon team. Finding his social circle.
- **Modules:** Money (survival budget, savings goal), Habits (study routine discipline), Career (internship prep, competitive programming), Focus (coding sessions), Community (hackathon team challenges).

---

### 37. Ana González (`ana`)
**50yo · Santiago, Chile · CLP**

Food blogger (ElRincónDeAna.cl — 500,000 monthly visitors) and cookbook author (2 published titles, 3rd in progress). Married to Rodrigo (retired architect); two adult children in their 20s. Semi-empty nester.

- **Financial snapshot:** CLP 4,500,000–7,000,000/month (blog AdSense + brand partnerships + book royalties). Irregular income. Variable-cost business (food photography, recipe testing).
- **Business:** Content business — blog, YouTube cooking channel, cookbook writing contracts.
- **Nutrition:** Deeply engaged with food and nutrition. Tests 10–15 recipes/week. Chilean and Latin American cuisine focus.
- **Travel:** Food travel (Peru, Mexico, Spain) for recipe research and brand trips.
- **Career:** Building personal culinary brand. TV opportunity emerging.
- **Modules:** Business (content revenue tracking, brand deal invoicing), Nutrition (recipe database, meal planning), Career (brand building, TV opportunity), Money (variable income budgeting), Travel (food research trips).

---

### 38. Ivan Marchenko (`ivan`)
**35yo · Warsaw, Poland · PLN**

Ukrainian IT freelancer (backend developer). Fled Kyiv in March 2022 with wife Olena. Settled in Warsaw with a Ukrainian diaspora community. Bills clients in USD ($85/hour); saves in USD; daily expenses in PLN.

- **Financial snapshot:** USD 6,000–9,500/month (variable project income). Converts to PLN for expenses. Saves in USD. Ukrainian bank accounts frozen. Starting to invest in US ETFs via a Polish broker.
- **Legal:** Ukrainian refugee status documentation, Polish TRP (temporary residence), tax residency complexities (Poland vs Ukraine).
- **Mind:** War anxiety, displacement grief, survivor's guilt. Therapy every 2 weeks.
- **Vault:** Refugee documents, Ukrainian national ID, Polish residence papers, insurance.
- **Career:** Building a stable client roster — reducing dependency on platforms (Upwork/Toptal) to direct clients.
- **Modules:** Money (USD→PLN tracking, multi-currency), Career (freelance client development), Mind (displacement journaling, grief), Legal (refugee/residence documentation), Vault (identity and legal documents).

---

### 39. Hana Yamamoto (`hana_y`)
**68yo · Osaka, Japan · JPY**

Retired primary school teacher (36 years service). Widowed — husband Kenji passed 2020. Lives alone in a Suita, Osaka apartment. Two adult children: daughter Yuki in Tokyo, son Hiroki in Nagoya. Tech-novice — uses the app at daughter's recommendation.

- **Financial snapshot:** JPY 165,000/month pension (government teachers' pension). Savings JPY 8M in Japan Post savings (Yucho). No investments. Simple, secure financial life.
- **Health:** Mild hypertension, regular clinic visits. Age-related vision decline (needs large text).
- **Habits:** Morning radio taiso (exercise), tea ceremony on Sundays, neighbourhood volunteering.
- **Mind:** Grief journaling (Kenji), finding purpose in retirement, grandparent role.
- **Home:** Own apartment. Ageing-in-place: bathroom grab rails, stair lift consideration.
- **Accessibility:** Large text, high contrast. Needs very simple navigation.
- **Modules:** Mind (grief, purpose-finding, grandparent journaling), Home (apartment maintenance, accessible modifications), Vault (pension documents, will, medical POA), Network (staying connected with Yuki and Hiroki), Habits (gentle wellness routines).

---

### 40. Michael Osei (`michael`)
**31yo · Accra, Ghana · GHS**

Head coach at the Premier Division club Kotoko Youth FC and founder of the Osei Football Academy (30 youth players, ages 8–16). Married to Abena. Social impact is his driving force — providing structured sports pathways for at-risk youth in Accra.

- **Financial snapshot:** GHS 8,500/month coaching salary + GHS 3,000–6,000/month academy fees. Academy has costs (kit, pitch rental, coaching staff). Savings target: permanent training ground.
- **Business:** Youth football academy — enrollment management, coaching staff payroll, equipment procurement, parent communications.
- **Career:** Pursuing UEFA B coaching licence. Aspirational: become a national team assistant coach.
- **Community:** Academy is central to his community. Monthly challenges for academy players and parents.
- **Network:** Ghana FA contacts, former pro player network, NGO sports development contacts.
- **Modules:** Career (coaching certifications, career progression), Business (academy management, revenue), Community (player challenges, parent engagement), Money (dual income tracking, capital saving), Network (football industry CRM).

---

### 41. Preethi Kumar (`preethi`)
**38yo · Chennai, India · INR**

Left a corporate marketing career in 2018 to raise her children full-time. Founded TamizhLearn (EdTech platform for Tamil-medium school students) in 2024 after recognising the gap in her children's learning support. Married to Karthik (IT architect); two kids (Arya 7, Dev 4).

- **Financial snapshot:** INR 0 personal salary (re-investing in business). Karthik earns INR 1,80,000/month. TamizhLearn: INR 45,000/month revenue (growing). Target: INR 2L/month by end of year.
- **Business:** EdTech platform — Tamil-medium curriculum support (Class 1–8). 340 paying students. 2 part-time teachers. Content creation, teacher payroll, Razorpay billing.
- **Career:** Founder growth — pitching to angel investors. Attended iStart Tamil Nadu programme.
- **Family:** AURA for Dev (speech development monitoring). Arya's Grade 2 school schedule.
- **Mind:** Identity transition (homemaker → founder). Managing guilt and confidence.
- **Modules:** Business (EdTech platform management, student billing), Career (founder skills, investor pitching), Family (2 kids, AURA for Dev), Mind (identity confidence journaling), Network (EdTech ecosystem, investor contacts).

---

## Seed Script Locations

```
tests/e2e-personas/
├── personas.ts                              # Persona interface + PERSONAS array (all 41)
│
├── # Fatima (persona 3) — split by domain:
├── seed-fatima-money.mjs
├── seed-fatima-family.mjs
├── seed-fatima-mind-nutrition.mjs
├── seed-fatima-career-network.mjs
├── seed-fatima-business-home-travel.mjs
├── seed-fatima-protection-legal-insights.mjs
├── seed-fatima-habits-memory-focus-decisions.mjs
├── seed-fatima-mind-backfill.mjs
│
├── # Other original personas — single file each:
├── seed-priya-all.mjs
├── seed-james-all.mjs
├── seed-carlos-all.mjs
├── seed-yuki-all.mjs
├── seed-sarah-all.mjs
├── seed-abdullah-all.mjs
├── seed-emma-all.mjs
├── seed-rajesh-all.mjs
├── seed-nina-all.mjs
│
└── # New personas 11-41 — single comprehensive file each:
    ├── seed-amara-all.mjs
    ├── seed-hiroshi-all.mjs
    ├── seed-sofia-all.mjs
    ├── seed-mohamed-all.mjs
    ├── seed-grace-all.mjs
    ├── seed-dmitri-all.mjs
    ├── seed-isabel-all.mjs
    ├── seed-kofi-all.mjs
    ├── seed-lena-all.mjs
    ├── seed-arjun-all.mjs
    ├── seed-mei-all.mjs
    ├── seed-omar-m-all.mjs
    ├── seed-maria-all.mjs
    ├── seed-robert-all.mjs
    ├── seed-kavya-all.mjs
    ├── seed-tunde-all.mjs
    ├── seed-leila-all.mjs
    ├── seed-patrick-all.mjs
    ├── seed-amelia-all.mjs
    ├── seed-ravi-all.mjs
    ├── seed-zainab-all.mjs
    ├── seed-pierre-all.mjs
    ├── seed-aisha-all.mjs
    ├── seed-lucas-all.mjs
    ├── seed-nadia-all.mjs
    ├── seed-rahul-all.mjs
    ├── seed-ana-all.mjs
    ├── seed-ivan-all.mjs
    ├── seed-hana-y-all.mjs
    ├── seed-michael-all.mjs
    └── seed-preethi-all.mjs
```

## Running Seeds

```bash
# Prerequisites: ensure SUPABASE_URL + SERVICE_KEY are set in each seed file (or export as env vars)

# Individual persona:
node tests/e2e-personas/seed-amara-all.mjs

# All new personas (11-41) in sequence:
for f in tests/e2e-personas/seed-amara-all.mjs \
          tests/e2e-personas/seed-hiroshi-all.mjs \
          tests/e2e-personas/seed-sofia-all.mjs \
          tests/e2e-personas/seed-mohamed-all.mjs \
          tests/e2e-personas/seed-grace-all.mjs \
          tests/e2e-personas/seed-dmitri-all.mjs \
          tests/e2e-personas/seed-isabel-all.mjs \
          tests/e2e-personas/seed-kofi-all.mjs \
          tests/e2e-personas/seed-lena-all.mjs \
          tests/e2e-personas/seed-arjun-all.mjs \
          tests/e2e-personas/seed-mei-all.mjs \
          tests/e2e-personas/seed-omar-m-all.mjs \
          tests/e2e-personas/seed-maria-all.mjs \
          tests/e2e-personas/seed-robert-all.mjs \
          tests/e2e-personas/seed-kavya-all.mjs \
          tests/e2e-personas/seed-tunde-all.mjs \
          tests/e2e-personas/seed-leila-all.mjs \
          tests/e2e-personas/seed-patrick-all.mjs \
          tests/e2e-personas/seed-amelia-all.mjs \
          tests/e2e-personas/seed-ravi-all.mjs \
          tests/e2e-personas/seed-zainab-all.mjs \
          tests/e2e-personas/seed-pierre-all.mjs \
          tests/e2e-personas/seed-aisha-all.mjs \
          tests/e2e-personas/seed-lucas-all.mjs \
          tests/e2e-personas/seed-nadia-all.mjs \
          tests/e2e-personas/seed-rahul-all.mjs \
          tests/e2e-personas/seed-ana-all.mjs \
          tests/e2e-personas/seed-ivan-all.mjs \
          tests/e2e-personas/seed-hana-y-all.mjs \
          tests/e2e-personas/seed-michael-all.mjs \
          tests/e2e-personas/seed-preethi-all.mjs; do
  echo "Seeding $f..."
  node "$f"
done
```

## Design Principles

- **Cultural authenticity:** Each persona uses real institutions, services, and currency amounts appropriate to their country.
- **Module diversity:** No two personas use exactly the same priority module set.
- **Financial realism:** Income and expense amounts are country-calibrated (not USD-converted).
- **Accessibility coverage:** 5 personas have explicit accessibility needs (large text, high contrast, voice input, ADHD-friendly, reduced motion).
- **Sensitivity coverage:** Emma (eating disorder), Robert (PTSD), Amelia (ADHD), Rajesh (bereavement), Maria (family separation), Ivan (war displacement), Hana (elder grief).
- **RTL coverage:** Fatima (ar-AE), Abdullah (ur-PK), Mohamed (ar-EG), Zainab (ar-SA) — four right-to-left locales.
- **Age range:** 19 (Rahul) to 71 (Rajesh) — spans student to retired.
- **Geography:** 26 countries, 6 continents represented.
