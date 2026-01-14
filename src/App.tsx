// App is now a thin composition root that delegates to the MVC-style controller.
import AppController from "./controllers/AppController"

export default function App() {
  return <AppController />
}
