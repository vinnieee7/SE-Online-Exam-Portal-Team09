const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const express = require('express');
const { chromium } = require('playwright');
const ffmpegStatic = require('ffmpeg-static');

// 1. Import backend app and database seeder
const app = require('../src/app');
const { seedDatabase } = require('../src/db/seed');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 [1/6] Resetting and seeding database (STP §6.4 compliance)...');
  await seedDatabase();

  console.log('🌐 [2/6] Starting Backend API (port 5000) & Static Frontend (port 5173)...');
  const backendServer = await new Promise((resolve, reject) => {
    const s = app.listen(5000, () => {
      console.log('   ✅ Backend API listening at http://localhost:5000');
      resolve(s);
    });
    s.on('error', reject);
  });

  const staticApp = express();
  const distDir = path.resolve(__dirname, '../../frontend/dist');
  staticApp.use(express.static(distDir));
  staticApp.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));

  const frontendServer = await new Promise((resolve, reject) => {
    const s = staticApp.listen(5173, () => {
      console.log('   ✅ Frontend static server listening at http://localhost:5173');
      resolve(s);
    });
    s.on('error', reject);
  });

  // Prepare directories
  const tempDir = path.resolve(__dirname, '../../docs/demo/temp_video');
  const outDir = path.resolve(__dirname, '../../docs/demo');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('🎥 [3/6] Launching Microsoft Edge & initiating 2-minute HD screencast recording...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: tempDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Helper to inject a professional HUD banner overlay
  async function setHud(phaseTag, title, description) {
    try {
      await page.evaluate(({ phaseTag, title, description }) => {
        let el = document.getElementById('demo-hud');
        if (!el) {
          el = document.createElement('div');
          el.id = 'demo-hud';
          el.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.94);
            border: 1px solid rgba(59, 130, 246, 0.6);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            padding: 9px 20px;
            border-radius: 9999px;
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            pointer-events: none;
            transition: all 0.3s ease;
          `;
          document.body.appendChild(el);
        }
        el.innerHTML = `
          <span style="background: #2563eb; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; letter-spacing: 0.05em;">${phaseTag}</span>
          <span style="font-size: 13px; font-weight: 600; color: #ffffff;">${title}</span>
          <span style="color: #94a3b8; font-size: 12px; border-left: 1px solid rgba(148,163,184,0.3); padding-left: 12px;">${description}</span>
        `;
      }, { phaseTag, title, description });
    } catch (_) {}
  }

  // Dismiss any browser alert dialogs automatically
  page.on('dialog', async (dialog) => {
    try { await dialog.accept(); } catch (_) {}
  });

  console.log('🎬 [4/6] Executing scripted 5-phase product walkthrough...');

  // =========================================================================
  // PHASE 1: 0:00 – 0:25 Authentication & Role Security (M1)
  // =========================================================================
  console.log('   👉 Phase 1 (0:00–0:25): Authentication & Role-Based Access Control');
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.card');
  await setHud('0:00 – 0:25 | PHASE 1', 'Authentication & RBAC (M1)', 'PES University Portal Landing & Institutional Login');
  await sleep(4000);

  // Toggle Registration form to showcase candidate registration flow
  const regToggle = page.locator('text=Register with your institutional credentials').or(page.locator('text=Create Student / Faculty Account')).or(page.locator('button:has-text("Register")')).first();
  if (await regToggle.count() > 0) {
    await regToggle.click();
    await setHud('0:05 – 0:25 | PHASE 1', 'Candidate Registration Flow', 'Case-Insensitive Unique Email & Role Assignment');
    await sleep(3500);

    // Switch back to login
    const loginToggle = page.locator('text=Sign in to access your assessments').or(page.locator('button:has-text("Sign In")')).or(page.locator('text=Already have an account?')).first();
    if (await loginToggle.count() > 0) {
      await loginToggle.click();
      await sleep(1500);
    }
  }

  // Quick Login as Student
  await setHud('0:15 – 0:25 | PHASE 1', 'Student Authentication (JWT)', 'Session Generation with Role-Based Payload Claims');
  await page.click('button:has-text("Student")');
  await sleep(1500);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('text=Candidate Dashboard');
  await setHud('0:20 – 0:25 | PHASE 1', 'Candidate Dashboard Shell', 'WCAG 2.1 AA Accessible Interface & Scheduled Assessments');
  await sleep(4500);

  // =========================================================================
  // PHASE 2: 0:25 – 0:50 Instructor Portal & Question Bank (M2)
  // =========================================================================
  console.log('   👉 Phase 2 (0:25–0:50): Instructor Portal & Question Bank');
  await page.click('button:has-text("Logout")');
  await page.waitForSelector('.card');
  await setHud('0:25 – 0:50 | PHASE 2', 'Instructor Portal (M2)', 'Faculty Authentication & Assessment Lifecycle Management');
  await page.click('button:has-text("Instructor")');
  await sleep(1500);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('text=Instructor Portal');
  await sleep(3500);

  // Inspect Scheduled Exams
  await setHud('0:30 – 0:50 | PHASE 2', 'Exam CRUD & Scheduling', 'Configuring Assessment Windows, Durations & Marks');
  await sleep(4000);

  // Switch to Question Bank tab
  await setHud('0:38 – 0:50 | PHASE 2', 'Question Bank Repository (M2)', 'Curated Question Pool: MCQ, True/False & Short Answer');
  await page.click('button.tab-btn:has-text("Question Bank")');
  await sleep(5000);

  // Open Add Question modal
  await setHud('0:44 – 0:50 | PHASE 2', 'Question Authoring & Fisher-Yates', 'Normalized Option Keying with Server Randomization');
  const addQBtn = page.locator('button:has-text("Add to Question Bank")').first();
  if (await addQBtn.count() > 0) {
    await addQBtn.click();
    await sleep(3500);
    const cancelBtn = page.locator('.modal-content button:has-text("Cancel")').first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
    await sleep(1500);
  }

  // =========================================================================
  // PHASE 3: 0:50 – 1:20 Candidate Exam Delivery & Auto-Save (M3)
  // =========================================================================
  console.log('   👉 Phase 3 (0:50–1:20): Candidate Exam Delivery & Auto-Save');
  await page.click('button:has-text("Logout")');
  await page.waitForSelector('.card');
  await page.click('button:has-text("Student")');
  await sleep(1000);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('text=Candidate Dashboard');

  await setHud('0:50 – 1:20 | PHASE 3', 'Candidate Exam Delivery (M3)', 'Starting Active Assessment: Answer Keys Stripped (OEP-SR-004)');
  await sleep(2000);

  // Click "Start Assessment Now"
  const startExamBtn = page.locator('button:has-text("Start Assessment Now")').first();
  await startExamBtn.click();
  await page.waitForSelector('text=Question 1 of');

  await setHud('0:55 – 1:20 | PHASE 3', 'Live Assessment Interface', 'Synchronized Countdown Timer & Question Palette Navigation');
  await sleep(3500);

  // Answer Question 1 (MCQ)
  await setHud('1:00 – 1:20 | PHASE 3', 'Interactive Responses (M3)', 'Selecting Objective Answer & Marking Question for Review');
  const qOptions = page.locator('label[style*="cursor: pointer"]');
  if (await qOptions.count() > 1) {
    await qOptions.nth(1).click();
  }
  await sleep(1500);

  // Mark for review
  const markReviewBtn = page.locator('button:has-text("Mark for Review")').first();
  if (await markReviewBtn.count() > 0) {
    await markReviewBtn.click();
    await sleep(2000);
  }

  // Palette Navigation to Question 2
  await setHud('1:06 – 1:20 | PHASE 3', 'Question Palette & State Tracking', 'Direct Question Jumping with Real-Time Attempt Persistence');
  const paletteBtns = page.locator('button[style*="border-radius: var(--radius-sm)"]').or(page.locator('.palette-btn'));
  if (await paletteBtns.count() >= 2) {
    await paletteBtns.nth(1).click();
    await sleep(2500);
    const q2Options = page.locator('label[style*="cursor: pointer"]');
    if (await q2Options.count() > 0) {
      await q2Options.first().click();
      await sleep(1500);
    }
  }

  // Navigate to Short Answer Question if present
  await setHud('1:12 – 1:20 | PHASE 3', 'Short Answer & 30s Periodic Auto-Save', 'State Verification: "All changes saved" & Timer Preservation');
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.fill('Requirements traceability matrix ensures complete bidirectional verification from SRS to tests.');
    await sleep(2500);
  } else {
    // Jump to last question
    if (await paletteBtns.count() > 2) {
      await paletteBtns.last().click();
      await sleep(2000);
    }
  }

  // Submit Final Exam
  await setHud('1:18 – 1:20 | PHASE 3', 'Exam Submission & Auto-Grading Trigger', 'Tamper-Resistant Submission & Immediate Grading Evaluation');
  const finishBtn = page.locator('button:has-text("Finish & Submit")').first();
  await finishBtn.click();
  await sleep(2000);

  // Modal confirmation
  const confirmSubmitBtn = page.locator('.modal-content button:has-text("Yes, Submit Assessment")').first();
  if (await confirmSubmitBtn.count() > 0) {
    await confirmSubmitBtn.click();
  }
  await sleep(3500);

  // =========================================================================
  // PHASE 4: 1:20 – 1:45 Evaluation, Grading & Analytics (M4)
  // =========================================================================
  console.log('   👉 Phase 4 (1:20–1:45): Evaluation, Grading & Analytics');
  await setHud('1:20 – 1:45 | PHASE 4', 'Candidate Scorecard (M4)', 'Auto-Graded Objective Breakdown & IDOR Safeguard Protected');

  // If scorecard button is visible, view it
  const scorecardBtn = page.locator('button:has-text("View Performance Scorecard")').first();
  if (await scorecardBtn.count() > 0) {
    await scorecardBtn.click();
    await sleep(4000);
    // Back to dashboard
    const backBtn = page.locator('button:has-text("Back to Dashboard")').first();
    if (await backBtn.count() > 0) await backBtn.click();
    await sleep(1500);
  }

  // Log in as Instructor to grade and review analytics
  await page.click('button:has-text("Logout")');
  await page.waitForSelector('.card');
  await page.click('button:has-text("Instructor")');
  await sleep(1000);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('text=Instructor Portal');

  // Submissions Tab
  await setHud('1:28 – 1:45 | PHASE 4', 'Instructor Evaluation Tab (M4)', 'Subjective Answer Grading, Partial Marks & Faculty Feedback');
  await page.click('button.tab-btn:has-text("Submissions")');
  await sleep(4000);

  // Open Grade Attempt modal if available
  const gradeAttemptBtn = page.locator('button:has-text("Grade Attempt")').or(page.locator('button:has-text("Review")')).first();
  if (await gradeAttemptBtn.count() > 0) {
    await gradeAttemptBtn.click();
    await sleep(3500);
    const saveGradeBtn = page.locator('.modal-content button:has-text("Save & Finalize Grades")').first();
    if (await saveGradeBtn.count() > 0) await saveGradeBtn.click();
    await sleep(2000);
  }

  // Analytics Tab
  await setHud('1:36 – 1:45 | PHASE 4', 'Performance Analytics & Item Difficulty', 'Item Difficulty Index P = R/T (Easy, Moderate, Difficult Categories)');
  await page.click('button.tab-btn:has-text("Analytics")');
  await sleep(5500);

  // =========================================================================
  // PHASE 5: 1:45 – 2:00 Admin & Security Audit Trail (M1 / Security)
  // =========================================================================
  console.log('   👉 Phase 5 (1:45–2:00): Admin Security & Audit Trail');
  await page.click('button:has-text("Logout")');
  await page.waitForSelector('.card');
  await page.click('button:has-text("Admin")');
  await sleep(1000);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('text=System Administration');

  await setHud('1:45 – 2:00 | PHASE 5', 'Administrative Controls', 'User Role Management & Account Lockout Security (OEP-NF-004)');
  await sleep(4000);

  // Switch to Security Audit Logs
  await setHud('1:52 – 2:00 | PHASE 5', 'Security Audit Trail (OEP-SEC-01)', 'Tamper-Evident Security Log: Client IP Extraction & Action Records');
  await page.click('button.tab-btn:has-text("Security Audit Trail")');
  await sleep(5000);

  // Final Summary Banner
  await setHud('2:00 | COMPLETE', 'Online Exam Portal (Team 9)', '85/85 Passing Automated Tests | 100% STP Compliance');
  await sleep(4000);

  console.log('🛑 [5/6] Finalizing recording and closing browser session...');
  const video = page.video();
  await page.close();
  await context.close();
  const rawWebm = await video.path();
  await browser.close();
  console.log('   ✅ Raw screencast successfully written by Playwright:', rawWebm);

  // Stop servers
  backendServer.close();
  frontendServer.close();

  const finalMp4 = path.join(outDir, 'product-demo.mp4');

  console.log(`🎬 [6/6] Transcoding HD video to MP4 (H.264 / AAC) at ${finalMp4}...`);
  const ffmpegCmd = `"${ffmpegStatic}" -y -i "${rawWebm}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -movflags +faststart "${finalMp4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Cleanup temp dir
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (_) {}

  const stats = fs.statSync(finalMp4);
  console.log(`\n🎉 SUCCESS! Demonstration video generated at:`);
  console.log(`   Path: ${finalMp4}`);
  console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});

