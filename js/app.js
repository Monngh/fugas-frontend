/**
 * REGLA CRÍTICA: API_URL dinámica.
 * En desarrollo usa localhost:3000, en producción usa la variable de entorno.
 * Vercel inyectará la variable si se configura, de lo contrario usamos el fallback.
 */
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tu-backend-en-render.onrender.com'; // Reemplazar con la URL real al desplegar

const leakForm = document.getElementById('leakForm');
const leaksTableBody = document.getElementById('leaksTableBody');
const loader = document.getElementById('loader');

// Cargar fugas al iniciar
document.addEventListener('DOMContentLoaded', fetchLeaks);

// Manejar envío del formulario
leakForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        direccion: document.getElementById('direccion').value,
        colonia: document.getElementById('colonia').value,
        nivelGravedad: document.getElementById('nivelGravedad').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch(`${API_URL}/api/fugas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('¡Reporte enviado con éxito!');
            leakForm.reset();
            fetchLeaks(); // Recargar la lista
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error('Error al enviar el reporte:', err);
        alert('Hubo un problema al conectar con el servidor.');
    }
});

// Función para obtener las fugas
async function fetchLeaks() {
    loader.classList.remove('hidden');
    leaksTableBody.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/api/fugas`);
        const data = await response.json();

        if (data.length === 0) {
            leaksTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No hay reportes registrados.</td></tr>';
        } else {
            renderLeaks(data);
        }
    } catch (err) {
        console.error('Error al obtener fugas:', err);
        leaksTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #ef4444">Error al cargar los datos. Asegúrate de que el backend esté corriendo.</td></tr>';
    } finally {
        loader.classList.add('hidden');
    }
}

// Renderizar la tabla
function renderLeaks(leaks) {
    leaksTableBody.innerHTML = leaks.map(fuga => `
        <tr>
            <td>
                <strong>${fuga.direccion}</strong><br>
                <small style="color: #94a3b8">${fuga.colonia}</small>
            </td>
            <td>
                <span class="badge badge-${fuga.nivelGravedad.toLowerCase()}">
                    ${fuga.nivelGravedad}
                </span>
            </td>
            <td>${fuga.descripcion}</td>
            <td>${new Date(fuga.fechaRegistro).toLocaleDateString()}</td>
        </tr>
    `).join('');
}
