# Especificación de Reportes - SaveTrack-Pro

Este documento detalla los reportes y estadísticas que deben implementarse para cada módulo del sistema. El objetivo es proporcionar una visión clara del estado financiero del usuario.

## 1. Módulo: Funding Accounts (Cuentas de Financiamiento)

**Objetivo:** Conocer la disponibilidad total de dinero y su distribución.

*   **Capital Total:** Suma de los balances de todas las cuentas activas del usuario.
*   **Balance por Cuenta:** Lista de cada cuenta con su saldo actual y el porcentaje que representa del capital total.
*   **Historial de Balance (Opcional):** Un histórico mensual del capital total para ver el crecimiento del patrimonio.

## 2. Módulo: Expense Transactions (Gastos)

**Objetivo:** Entender en qué se está gastando el dinero.

*   **Total de Gastos (Mes Actual):** Suma total de todos los gastos realizados en el mes en curso.
*   **Gastos por Categoría:** Agrupación (`GROUP BY`) de gastos por categoría para identificar los mayores focos de consumo.
*   **Comparativa Mensual:** Comparar el total de gastos del mes actual vs. el mes anterior.
*   **Top 5 Gastos:** Lista de las 5 transacciones individuales más costosas del mes.

## 3. Módulo: Income Transactions (Ingresos)

**Objetivo:** Identificar las fuentes de ingresos y su regularidad.

*   **Total de Ingresos (Mes Actual):** Suma total de todos los ingresos del mes.
*   **Ingresos por Fuente/Categoría:** Identificar qué canales generan más dinero (salario, ventas, inversiones, etc.).
*   **Ratio Ingreso/Gasto:** Un indicador que muestre qué porcentaje de los ingresos se está consumiendo en gastos.

## 4. Módulo: Savings Goals (Metas de Ahorro)

**Objetivo:** Monitorear el progreso hacia objetivos a largo plazo.

*   **Progreso Individual:** Porcentaje de avance de cada meta (`current_amount / target_amount * 100`).
*   **Total Ahorrado:** Suma de lo acumulado en todas las metas de ahorro.
*   **Proyección de Cumplimiento:** Basado en la fecha de fin (`end_date`), calcular cuánto debe ahorrar el usuario mensualmente para llegar a la meta.

---

## Dashboard Global (Propuesta de Endpoint General)

Lo ideal es tener un endpoint `GET /reports/dashboard` que devuelva un objeto consolidado para cargar la pantalla principal del frontend de un solo golpe:

```json
{
  "summary": {
    "total_capital": 5400.00,
    "monthly_income": 3000.00,
    "monthly_expenses": 1200.00,
    "net_savings": 1800.00
  },
  "expenses_by_category": [
    { "category": "Comida", "amount": 400.00, "percentage": 33.3 },
    { "category": "Renta", "amount": 800.00, "percentage": 66.7 }
  ],
  "savings_progress": [
    { "name": "Viaje a Japón", "progress": 45.0 }
  ]
}
```
