import { useMemo, useState } from 'react';
import { authService } from '../../services/authService';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const users = authService.listCustomers();
  const paged = useMemo(() => paginate(users, page), [users, page]);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Usuarios</h1>
        <p>Clientes registrados</p>
      </header>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Registro</th></tr>
          </thead>
          <tbody>
            {paged.items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone ?? '—'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('es-EC')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        onPageChange={setPage}
      />
    </div>
  );
}
