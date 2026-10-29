import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { ExpensesPage } from "./pages/ExpensesPage";
import { NewExpensePage } from "./pages/NewExpensePage";
import { EditExpensePage } from "./pages/EditExpensePage";
import { SettingsPage } from "./pages/SettingsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { HomePage } from "./pages/HomePage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { CalendarPage } from "./pages/CalendarPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pagos" element={<PaymentsPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/gastos" element={<ExpensesPage />} />
        <Route path="/gastos/nuevo" element={<NewExpensePage />} />
        <Route path="/gastos/:id/editar" element={<EditExpensePage />} />
        <Route path="/analisis" element={<AnalysisPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
