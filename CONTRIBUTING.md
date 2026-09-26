\# Convenciones de trabajo — MeVe



\## Ramas



\- `main`: produccion. Solo recibe merges desde `develop`.

\- `develop`: integracion. Es la rama base de todo el trabajo diario.



Ninguna de las dos acepta push directo. Todo entra por Pull Request

con al menos 1 aprobacion.



\## Nombre de las ramas



Formato: `area/nn-descripcion-corta`



\- `area`: `backend`, `frontend`, `infra` o `gestion`.

\- `nn`: numero de la tarjeta en el tablero de Notion.

\- `descripcion-corta`: 2 a 4 palabras.



Ejemplos:



\- `infra/01-git-flow`

\- `infra/02-ci-github-actions`

\- `backend/03-setup-spring-boot`

\- `frontend/04-setup-react-typescript`

\- `backend/05-modelado-multitenant`



Reglas: todo en minuscula, sin tildes ni enies, palabras separadas con

guiones, una rama por tarjeta. Para arreglos urgentes sobre produccion

se usa `hotfix/descripcion-corta`, que sale de `main`.



\## Flujo



1\. La rama sale de `develop` actualizado.

2\. El PR se abre contra `develop`.

3\. Lo revisa y aprueba otro integrante del equipo, nunca el autor.

4\. Despues del merge la rama se borra.

5\. `main` solo se actualiza con un PR desde `develop`.



\## Commits



Formato: `tipo: descripcion en presente`



Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.



Ejemplo: `feat: agregar endpoint de registro de comercios`

