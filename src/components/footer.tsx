export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Insumos Online. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
