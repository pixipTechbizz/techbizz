/**
 * Techbizz Integrators - Careers & HR CMS Portal Engine
 * Version: 1.0 (2026)
 * Supports: Real-time UI rendering, Cloud Supabase DB + Local fallback,
 * Resume handling, and WhatsApp / Email HR routing.
 */

const TechbizzCareerEngine = (function() {
    const STORAGE_KEY_JOBS = 'techbizz_jobs_v1';
    const STORAGE_KEY_APPS = 'techbizz_applications_v1';
    const STORAGE_KEY_CONFIG = 'techbizz_supabase_config';
    const HR_WHATSAPP = '919910895095';
    const HR_EMAIL = 'careers@techbizzintegrators.com';

    // Default seed openings (real Techbizz roles)
    const DEFAULT_JOBS = [
        {
            id: 'job-site-eng-01',
            title: 'Site Engineer - LED Displays',
            department: 'Site Operations & Engineering',
            location: 'Ghaziabad, UP / Delhi NCR (On-Site)',
            type: 'Full-Time',
            minExperience: 2,
            salary: '₹25,000 - ₹45,000 / month',
            description: 'Lead on-site installation, structural alignment, power distribution, and video processing setup for indoor and outdoor commercial LED video walls.',
            requirements: [
                'Hands-on experience in LED video wall cabinet assembly and power distribution',
                'Proficiency with video processors (NovaStar, Colorlight, Brompton)',
                'Willingness to travel for field installations and client commissioning',
                'Diploma or B.Tech in Electrical / Electronics or equivalent practical experience'
            ],
            status: 'active',
            date: '2026-10-22'
        },
        {
            id: 'job-autocad-02',
            title: 'AutoCAD & Structural Designer',
            department: 'Design & Engineering',
            location: 'Ghaziabad, UP (Headquarters)',
            type: 'Full-Time',
            minExperience: 1,
            salary: '₹25,000 - ₹40,000 / month',
            description: 'Create detailed 2D/3D fabrication drawings, structural steel load calculations, and mounting layouts for architectural LED screens and DOOH billboards.',
            requirements: [
                'Proficiency in AutoCAD 2D/3D and structural layout design',
                'Understanding of steel truss fabrication, mounting brackets, and load distribution',
                'Coordination with site installation engineers and fabrication vendors',
                'Diploma/Degree in Mechanical / Civil / Architectural Drafting'
            ],
            status: 'active',
            date: '2026-10-24'
        },
        {
            id: 'job-sales-03',
            title: 'B2B Corporate Sales Executive (LED & CCTV)',
            department: 'Sales & Business Development',
            location: 'Delhi NCR / Hybrid',
            type: 'Full-Time',
            minExperience: 2,
            salary: '₹3.5 - 6.0 LPA + Commission',
            description: 'Drive institutional and B2B project sales of large-format LED screens, control rooms, and enterprise CCTV solutions to architects, builders, and corporates.',
            requirements: [
                'Proven track record in B2B corporate sales, audio-visual (AV), or electronic security',
                'Strong relationship network with interior designers, corporate architects, and procurement heads',
                'Demonstrated capability in proposal presentation and client negotiations'
            ],
            status: 'active',
            date: '2026-10-25'
        }
    ];

    // Helper: Initialize Jobs
    function initJobs() {
        const stored = localStorage.getItem(STORAGE_KEY_JOBS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(DEFAULT_JOBS));
            return DEFAULT_JOBS;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            return DEFAULT_JOBS;
        }
    }

    // Helper: Initialize Applications
    function initApplications() {
        const stored = localStorage.getItem(STORAGE_KEY_APPS);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }

    // Public API Methods
    return {
        getJobs: function(activeOnly = false) {
            const jobs = initJobs();
            if (activeOnly) {
                return jobs.filter(j => j.status === 'active');
            }
            return jobs;
        },

        getJobById: function(id) {
            const jobs = initJobs();
            return jobs.find(j => j.id === id) || null;
        },

        saveJob: function(jobData) {
            let jobs = initJobs();
            if (jobData.id) {
                // Update
                const index = jobs.findIndex(j => j.id === jobData.id);
                if (index !== -1) {
                    jobs[index] = { ...jobs[index], ...jobData };
                } else {
                    jobs.push(jobData);
                }
            } else {
                // Create New
                jobData.id = 'job-' + Date.now();
                jobData.date = new Date().toISOString().split('T')[0];
                jobData.status = jobData.status || 'active';
                jobs.unshift(jobData);
            }
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
            return jobData;
        },

        deleteJob: function(id) {
            let jobs = initJobs();
            jobs = jobs.filter(j => j.id !== id);
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
            return true;
        },

        toggleJobStatus: function(id) {
            let jobs = initJobs();
            const job = jobs.find(j => j.id === id);
            if (job) {
                job.status = (job.status === 'active') ? 'closed' : 'active';
                localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
                return job.status;
            }
            return null;
        },

        submitApplication: function(appData) {
            let apps = initApplications();
            appData.id = 'app-' + Date.now();
            appData.submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            apps.unshift(appData);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
            return appData;
        },

        getApplications: function() {
            return initApplications();
        },

        deleteApplication: function(id) {
            let apps = initApplications();
            apps = apps.filter(a => a.id !== id);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
            return true;
        },

        // WhatsApp Deep Link generator
        getWhatsAppLink: function(jobTitle, candidateName, phone, exp, extra = '') {
            const text = `Hello Techbizz HR, I am applying for the position of *${jobTitle}*.\n\n` +
                `*Name:* ${candidateName || 'Candidate'}\n` +
                `*Phone:* ${phone || 'N/A'}\n` +
                `*Total Experience:* ${exp || 'N/A'}\n` +
                (extra ? `*Details:* ${extra}\n` : '') +
                `\nI am attaching my resume below. Please consider my application.`;
            return `https://wa.me/${HR_WHATSAPP}?text=${encodeURIComponent(text)}`;
        },

        // Mailto Link generator
        getMailtoLink: function(jobTitle, candidateName, phone, exp, extra = '') {
            const subject = `Job Application: ${jobTitle} - ${candidateName || 'Candidate'}`;
            const body = `Dear Techbizz HR Team,\n\n` +
                `I would like to apply for the position of "${jobTitle}" at Techbizz Integrators Private Limited.\n\n` +
                `Candidate Details:\n` +
                `- Full Name: ${candidateName || ''}\n` +
                `- Phone: ${phone || ''}\n` +
                `- Experience: ${exp || ''}\n` +
                (extra ? `- Note: ${extra}\n` : '') +
                `\nPlease find my resume attached with this email.\n\n` +
                `Best regards,\n${candidateName || ''}`;
            return `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        },

        // Export/Import for backup
        exportDataJSON: function() {
            const data = {
                jobs: initJobs(),
                applications: initApplications(),
                exportedAt: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        },

        importDataJSON: function(jsonString) {
            try {
                const data = JSON.parse(jsonString);
                if (data.jobs && Array.isArray(data.jobs)) {
                    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(data.jobs));
                }
                if (data.applications && Array.isArray(data.applications)) {
                    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(data.applications));
                }
                return true;
            } catch (e) {
                console.error("Import error:", e);
                return false;
            }
        }
    };
})();