# SnapCode

SnapCode is a mobile application designed to enhance coding education accessibility, particularly for students in underserved communities. Leveraging mobile technology and innovative design, SnapCode allows students to capture handwritten code on paper and interact with it on their mobile devices, bridging the gap created by limited access to computers and resources. The inspiration of this project was from my nonprofit initiative https://www.gogirlorganisation.com/ where we often face workshops with lack of computers.

https://github.com/japnitahuja/snapcode/assets/10168783/88ba3d3f-b8ea-4ee6-ad90-76d05cfdd278

## Features
**Image-to-Text Conversion**: Convert handwritten code images to text format using OCR technology.

**Interactive Code Editing**: Edit and debug code directly on your mobile device.

**Real Time Web View**: View the output of your code seamlessly.

**Multi-Modal Interaction**: Seamlessly switch between paper and digital platforms for coding activities.

**Exercises**: Follow a lesson plan to learn.


## 🚀 Get Started:

Clone the repository: `git clone https://github.com/japnitahuja/snapcode.git`

Navigate to the project directory: `cd snapcode`

For frontend:

Navigate to frontend folder: `cd frontend`

Install dependencies: `npm install`


For backend:

Navigate to backend folder: `cd backend`

Install dependencies: `npm install`


## 🔑 Credentials Setup


### 🔥 Firebase
To run this project, you'll need Firebase credentials. Follow these steps:

1. Go to [https://firebase.google.com](https://firebase.google.com) and sign in with your Google account.
2. Open the Firebase Console and create a new project.
3. Add a new **Web App** to your project.
4. Click the **gear icon ⚙️** next to "Project Overview" and go to **Project Settings**.
5. Navigate to the **Service Accounts** tab.
6. Click **"Generate new private key"** and confirm the download.
7. Save the downloaded file in the `/backend` folder, and rename it to `serviceAccountKey.json`.

In addition to the service account key, you'll need to set up Firebase config variables for the frontend.

1. Switch to the **General** tab and scroll down to the **Firebase SDK snippet** section.
2. Find the code snippet with the firebaseconfig and copy the values.
4. Copy the following values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
5. Create a `.env` file in the root of your `/frontend` directory and add the following:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```
> ⚠️ Make sure this file is listed in your `.gitignore` to keep your credentials secure.

### 📄 AWS Textract (.env for backend)

To enable OCR functionality using Amazon Textract, follow these steps:

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/home).
2. Create a new **IAM user** with **programmatic access**.
3. Attach the policy: **AmazonTextractFullAccess**.
4. After creating the user, save the following credentials:
   - **Access Key ID**
   - **Secret Access Key**
5. Choose a region that supports Textract (e.g., `us-east-1`).
6. In the `backend/` folder, create a `.env` file and add:

   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key

## Run the project

For backend:

Navigate to backend folder: `cd backend`

Start the development server: `npm start`

For frontend:

Navigate to frontend folder: `cd frontend`

Start the development server: `npm start`

Once the frontend server is running, open [http://localhost:3000](http://localhost:3000) in your browser to view the app.


## Contributing
Contributions to SnapCode are welcome! If you'd like to contribute, please follow these guidelines:

Fork the repository and create a new branch for your feature or bug fix.
Submit a pull request detailing your changes and any relevant information.

## License
SnapCode is licensed under the MIT License. Feel free to use, modify, and distribute the code for both commercial and non-commercial purposes.
