import "./NotFoundPage.scss";

/**
 * NotFoundPage component
 * @returns {JSX.Element}
 */
function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center h-full">
      <h1 className="font-bold">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </section>
  );
}

export default NotFoundPage;
