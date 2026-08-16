# Implementation Notes

The approved PRD remains the source of truth for product behavior and visual direction. The managed WebApp environment provides a single React and Node server with built-in authentication, typed procedures, and a managed relational database. Accordingly, the implementation preserves the requested MVP experience while adapting the infrastructure layer to the platform contract.

| PRD direction | Managed implementation | Product impact |
|---|---|---|
| React with Tailwind CSS | React 19, Tailwind CSS 4, and the provided component library | The responsive interface and cyberpunk visual system are implemented directly. |
| Flask/Python model endpoint | Server-side typed procedure calling the platform’s protected LLM helper | Credentials remain server-side and the prediction contract is available to the UI without a public API key. |
| LSTM/Bi-LSTM model label | The dashboard labels the model as the PRD’s intended LSTM/Bi-directional concept; the live implementation uses the configured server-side AI model for the MVP | The user-facing workflow remains Fake/Real classification with confidence, processing time, structured explanation, and disclaimer. |
| MongoDB | Managed relational database through Drizzle | Prediction records support authenticated ownership, search, filters, sorting, statistics, and deletion. |
| JWT authentication | Managed OAuth session flow supplied by the project runtime | Login/logout and protected dashboard behavior are implemented without custom credential handling. |
| Flask deployment | Managed single-service WebApp deployment | The project can be reviewed in the built-in preview and checkpointed for publishing. |

The AI result is deliberately described as **pattern-based and not verified facts**. The structured explanation covers linguistic patterns, emotional tone, credibility signals, influential phrases, confidence, and processing time. Users should independently verify consequential claims.
