# Food Photo Log

A simple app to log food photos for sharing with your nutritionist. Upload photos easily from your phone and view them grouped by day of the week.

## Features

- 📸 Upload food photos with optional descriptions
- 📅 View photos grouped by day of the week (Monday-Sunday)
- 🖼️ Automatic image resizing (max 1920px width, 85% JPEG quality) to save storage space
- 📱 Mobile-optimized with camera capture support
- 💾 Uses Vercel Blob Storage for cheap, serverless storage
- 🗑️ Manual cleanup option - photos are stored indefinitely until you delete them

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Vercel Blob Storage:**

   **Step 1:** Go to [vercel.com](https://vercel.com) and sign up/login

   **Step 2:** In your Vercel dashboard, go to the **Storage** tab (or visit [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores))

   **Step 3:** Click **Create Database** or **Create Store**, then select **Blob**

   **Step 4:** Give your blob store a name (e.g., "food-photo-log") and select a region

   **Step 5:** After creating the store, you'll see a page with connection details. Look for **Environment Variables** section

   **Step 6:** Copy the value of `BLOB_READ_WRITE_TOKEN` (it will look like `vercel_blob_rw_...`)

3. **Configure environment variables:**

   **Step 1:** Create a `.env.local` file in the project root:
   ```bash
   touch .env.local
   ```

   **Step 2:** Add your token to `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
   ```

   **Note:** Replace `vercel_blob_rw_your_token_here` with the actual token you copied from Vercel

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy to Vercel:**
   - Import your GitHub repository in Vercel
   - Add the `BLOB_READ_WRITE_TOKEN` environment variable in Vercel dashboard
   - Deploy!

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - React components
- `/lib` - Utility functions (blob storage, date utilities)
- `/types` - TypeScript type definitions

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Styled Components
- Vercel Blob Storage
- Sharp (for image resizing)

