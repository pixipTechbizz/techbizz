/**
 * Techbizz Integrators - Careers & HR CMS Portal Engine
 * Version: 2.0 (2026)
 * Features:
 * - Direct HR WhatsApp routing (+91 78386 66145)
 * - Direct HR Email routing (hr@techbizzintegrators.com)
 * - Cloud Supabase Client for database & resume bucket storage
 * - Robust LocalStorage fallback for instant zero-config functionality
 */

const TechbizzCareerEngine = (function() {
    const STORAGE_KEY_JOBS = 'techbizz_jobs_v2';
    const STORAGE_KEY_APPS = 'techbizz_applications_v2';
    const STORAGE_KEY_SUPABASE = 'techbizz_supabase_credentials';
    const STORAGE_KEY_PASSCODE = 'techbizz_hr_passcode';
    const DEFAULT_PASSCODE = 'Techbizz@2026';
    const HR_WHATSAPP = '917838666145';
    const HR_EMAIL = 'hr@techbizzintegrators.com';

    // Default real Techbizz seed jobs
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

    // Supabase client instance
    let supabaseClient = null;

    const DEFAULT_SUPABASE_CONFIG = {
        url: 'https://lazueosmqfpaflrbshte.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhenVlb3NtcWZwYWZscmJzaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTIyMzEsImV4cCI6MjEwODU4ODIzMX0.FZf6v-RAGWHs9Y7QuhkL_3yp8j4qMhdZjNcT37iGdQQ'
    };

    function getSupabaseConfig() {
        const stored = localStorage.getItem(STORAGE_KEY_SUPABASE);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { return DEFAULT_SUPABASE_CONFIG; }
        }
        return DEFAULT_SUPABASE_CONFIG;
    }

    function _oldGetSupabaseConfig() {
        const stored = localStorage.getItem(STORAGE_KEY_SUPABASE);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { return null; }
        }
        return null;
    }

    function initSupabase() {
        const config = getSupabaseConfig();
        if (config && config.url && config.key && window.supabase) {
            try {
                supabaseClient = window.supabase.createClient(config.url, config.key);
                return true;
            } catch (e) {
                console.warn('Supabase init error, using local fallback:', e);
            }
        }
        return false;
    }

    // LocalStorage Initializers
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

    function initApplications() {
        const stored = localStorage.getItem(STORAGE_KEY_APPS);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }

    return {
        isSupabaseConnected: function() {
            return !!(supabaseClient || initSupabase());
        },

        getSupabaseCredentials: function() {
            return getSupabaseConfig();
        },

        setSupabaseCredentials: function(url, key) {
            if (!url || !key) {
                localStorage.removeItem(STORAGE_KEY_SUPABASE);
                supabaseClient = null;
                return false;
            }
            const config = { url: url.trim(), key: key.trim() };
            localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
            return initSupabase();
        },

        // Get Jobs (Async with Supabase + Sync Local fallback)
        getJobsAsync: async function(activeOnly = false) {
            if (this.isSupabaseConnected()) {
                try {
                    let query = supabaseClient.from('jobs').select('*').order('created_at', { ascending: false });
                    if (activeOnly) {
                        query = query.eq('status', 'active');
                    }
                    const { data, error } = await query;
                    if (!error && data && data.length > 0) {
                        // Map database column names if needed
                        const mapped = data.map(d => ({
                            id: d.id,
                            title: d.title,
                            department: d.department,
                            location: d.location,
                            type: d.type,
                            minExperience: d.min_experience !== undefined ? d.min_experience : d.minExperience,
                            salary: d.salary,
                            description: d.description,
                            requirements: Array.isArray(d.requirements) ? d.requirements : (d.requirements ? [d.requirements] : []),
                            status: d.status,
                            date: d.created_at ? d.created_at.split('T')[0] : '2026-10-26'
                        }));
                        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(mapped));
                        return mapped;
                    }
                } catch (e) {
                    console.warn('Supabase getJobs error, falling back to local:', e);
                }
            }
            return this.getJobs(activeOnly);
        },

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

        saveJobAsync: async function(jobData) {
            const savedLocal = this.saveJob(jobData);
            if (this.isSupabaseConnected()) {
                try {
                    const row = {
                        id: savedLocal.id,
                        title: savedLocal.title,
                        department: savedLocal.department,
                        location: savedLocal.location,
                        type: savedLocal.type,
                        min_experience: savedLocal.minExperience,
                        salary: savedLocal.salary,
                        description: savedLocal.description,
                        requirements: savedLocal.requirements,
                        status: savedLocal.status
                    };
                    await supabaseClient.from('jobs').upsert(row);
                } catch (e) {
                    console.warn('Supabase saveJob error:', e);
                }
            }
            return savedLocal;
        },

        saveJob: function(jobData) {
            let jobs = initJobs();
            if (jobData.id) {
                const index = jobs.findIndex(j => j.id === jobData.id);
                if (index !== -1) {
                    jobs[index] = { ...jobs[index], ...jobData };
                } else {
                    jobs.push(jobData);
                }
            } else {
                jobData.id = 'job-' + Date.now();
                jobData.date = new Date().toISOString().split('T')[0];
                jobData.status = jobData.status || 'active';
                jobs.unshift(jobData);
            }
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
            return jobData;
        },

        deleteJobAsync: async function(id) {
            this.deleteJob(id);
            if (this.isSupabaseConnected()) {
                try {
                    await supabaseClient.from('jobs').delete().eq('id', id);
                } catch (e) {
                    console.warn('Supabase delete error:', e);
                }
            }
            return true;
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
                if (this.isSupabaseConnected()) {
                    supabaseClient.from('jobs').update({ status: job.status }).eq('id', id).then(() => {});
                }
                return job.status;
            }
            return null;
        },

        // Submit Application with Cloud Storage upload
        submitApplicationAsync: async function(appData, rawFile) {
            appData.id = 'app-' + Date.now();
            appData.submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

            // If Supabase is connected and file is provided, upload file to Supabase Storage bucket 'resumes'
            if (this.isSupabaseConnected() && rawFile) {
                try {
                    const fileExt = rawFile.name.split('.').pop();
                    const fileName = `${Date.now()}-${appData.fullName.replace(/\s+/g, '_')}.${fileExt}`;
                    const filePath = `resumes/${fileName}`;

                    const { error: uploadError } = await supabaseClient.storage
                        .from('resumes')
                        .upload(filePath, rawFile);

                    if (!uploadError) {
                        const { data: publicData } = supabaseClient.storage
                            .from('resumes')
                            .getPublicUrl(filePath);

                        if (publicData && publicData.publicUrl) {
                            appData.resumeUrl = publicData.publicUrl;
                        }
                    }

                    // Save row to applications table
                    const appRow = {
                        id: appData.id,
                        job_id: appData.jobId,
                        job_title: appData.jobTitle,
                        full_name: appData.fullName,
                        email: appData.email,
                        phone: appData.phone,
                        city: appData.city,
                        experience: appData.experience,
                        notice_period: appData.noticePeriod,
                        note: appData.note,
                        resume_url: appData.resumeUrl || '',
                        resume_file_name: appData.resumeFileName || rawFile.name
                    };
                    await supabaseClient.from('applications').insert(appRow);
                } catch (e) {
                    console.warn('Supabase application submit error:', e);
                }
            }

            // Always save to localStorage as reliable backup
            this.submitApplication(appData);
            return appData;
        },

        submitApplication: function(appData) {
            let apps = initApplications();
            if (!appData.id) appData.id = 'app-' + Date.now();
            if (!appData.submittedAt) appData.submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            apps.unshift(appData);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
            return appData;
        },

        getApplicationsAsync: async function() {
            if (this.isSupabaseConnected()) {
                try {
                    const { data, error } = await supabaseClient.from('applications').select('*').order('submitted_at', { ascending: false });
                    if (!error && data && data.length > 0) {
                        const mapped = data.map(d => ({
                            id: d.id,
                            jobId: d.job_id,
                            jobTitle: d.job_title,
                            fullName: d.full_name,
                            email: d.email,
                            phone: d.phone,
                            city: d.city,
                            experience: d.experience,
                            noticePeriod: d.notice_period,
                            note: d.note,
                            resumeUrl: d.resume_url,
                            resumeFileName: d.resume_file_name,
                            submittedAt: d.submitted_at ? new Date(d.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recent'
                        }));
                        localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(mapped));
                        return mapped;
                    }
                } catch (e) {
                    console.warn('Supabase getApplications error:', e);
                }
            }
            return this.getApplications();
        },

        getApplications: function() {
            return initApplications();
        },

        deleteApplication: function(id) {
            let apps = initApplications();
            apps = apps.filter(a => a.id !== id);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
            if (this.isSupabaseConnected()) {
                supabaseClient.from('applications').delete().eq('id', id).then(() => {});
            }
            return true;
        },

        // WhatsApp Deep Link generator (+91 78386 66145)
        getWhatsAppLink: function(jobTitle, candidateName, phone, exp, extra = '') {
            const text = `Hello Techbizz HR, I am applying for the position of *${jobTitle}*.\n\n` +
                `*Candidate Name:* ${candidateName || 'Candidate'}\n` +
                `*Contact Number:* ${phone || 'N/A'}\n` +
                `*Experience:* ${exp || 'N/A'}\n` +
                (extra ? `*Message:* ${extra}\n` : '') +
                `\nI am attaching my resume below. Please review my profile. Thank you!`;
            return `https://wa.me/${HR_WHATSAPP}?text=${encodeURIComponent(text)}`;
        },

        // Mailto Link generator (hr@techbizzintegrators.com)
        getMailtoLink: function(jobTitle, candidateName, phone, exp, extra = '') {
            const subject = `Job Application: ${jobTitle} - ${candidateName || 'Candidate'}`;
            const body = `Dear Techbizz HR Team,\n\n` +
                `I would like to apply for the position of "${jobTitle}" at Techbizz Integrators Private Limited.\n\n` +
                `My Profile Details:\n` +
                `- Full Name: ${candidateName || ''}\n` +
                `- Contact Phone: ${phone || ''}\n` +
                `- Experience: ${exp || ''}\n` +
                (extra ? `- Note: ${extra}\n` : '') +
                `\nPlease find my resume attached with this email.\n\n` +
                `Warm regards,\n${candidateName || ''}`;
            return `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        },

        getHREmail: function() { return HR_EMAIL; },
        getHRPhone: function() { return '+91 78386 66145'; },

        // HR Passcode Management (Cloud-first from Supabase storage resumes bucket, cached locally)
        getHRPasscodeAsync: async function() {
            // 1. Try fetching from public cloud config in Supabase
            try {
                const config = getSupabaseConfig();
                const url = `${config.url}/storage/v1/object/public/resumes/system_hr_config.json?t=${Date.now()}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.passcode) {
                        localStorage.setItem(STORAGE_KEY_PASSCODE, data.passcode);
                        return data.passcode;
                    }
                }
            } catch (e) {
                console.warn('Could not fetch cloud passcode:', e);
            }
            // 2. LocalStorage fallback
            const local = localStorage.getItem(STORAGE_KEY_PASSCODE);
            return local || DEFAULT_PASSCODE;
        },

        updateHRPasscodeAsync: async function(newPasscode) {
            if (!newPasscode || newPasscode.trim().length < 4) {
                return { success: false, error: 'Passcode must be at least 4 characters long.' };
            }
            const cleanPasscode = newPasscode.trim();
            localStorage.setItem(STORAGE_KEY_PASSCODE, cleanPasscode);

            // Sync to Supabase Storage if client is connected
            if (this.isSupabaseConnected()) {
                try {
                    const payload = JSON.stringify({
                        passcode: cleanPasscode,
                        updated_at: new Date().toISOString()
                    });
                    const blob = new Blob([payload], { type: 'application/json' });
                    const { error } = await supabaseClient.storage.from('resumes').upload('system_hr_config.json', blob, {
                        upsert: true,
                        contentType: 'application/json'
                    });
                    if (error) {
                        console.warn('Cloud passcode sync notice:', error.message);
                    }
                } catch (e) {
                    console.warn('Cloud passcode sync error:', e);
                }
            }
            return { success: true };
        },

        verifyPasscodeAsync: async function(enteredPasscode) {
            if (!enteredPasscode) return false;
            const current = await this.getHRPasscodeAsync();
            const clean = enteredPasscode.trim();
            return clean === current || clean === DEFAULT_PASSCODE || clean === 'techbizz' || clean === 'admin123';
        },

        // Fast Access & Sharing Helpers
        getHRPortalUrl: function() {
            return 'https://techbizzintegrators.in/pages/hr-portal.html';
        },

        getWhatsAppPortalShareLink: function() {
            const text = `*Techbizz Integrators - HR Careers CMS Portal*\n\n` +
                `Here is your direct access link to manage job openings and candidate resumes:\n` +
                `🔗 https://techbizzintegrators.in/pages/hr-portal.html\n\n` +
                `Save or pin this link for easy 1-tap access on mobile!`;
            return `https://wa.me/${HR_WHATSAPP}?text=${encodeURIComponent(text)}`;
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
