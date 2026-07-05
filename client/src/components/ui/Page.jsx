import Header from '../Header.jsx';

export default function Page({ title, subtitle, action, children }) {
  return (
    <>
      <Header title={title} subtitle={subtitle} action={action} />
      <div className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-5 sm:px-6">{children}</div>
    </>
  );
}
