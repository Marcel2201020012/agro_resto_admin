export const Notfound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-gray-300 tracking-widest">404</h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-700 mt-4">
          Oops! Page not found
        </p>
        <p className="text-gray-500 mt-2">
          The page you’re looking for doesn’t exist or is temporarily unavailable.
        </p>

      </div>
    </div>
  );
};
