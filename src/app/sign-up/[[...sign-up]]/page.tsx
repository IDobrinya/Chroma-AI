import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="p-4 bg-gray-900 rounded-lg shadow-xl mt-8">
        <h1 className="text-white text-3xl font-bold mb-4 text-center">
          Chroma AI sign up
        </h1>
        <SignUp/>
      </div>
    </div>
  );
}