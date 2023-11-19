// Importazione librerie
const   dotenv                  =   require("dotenv").config();
const   express                 =   require("express");

// Importazione controllers
const   homePageController      =   require("./controllers/homePageController");

// Importazione routers
const   routerEvents            =   require("./routers/routerEvents");

// Importazione middlewares
const   middlewareRouteNotFound =   require("./middlewares/middlewareRouteNotFound");
const   middlewareErrorHandling =   require("./middlewares/middlewareErrorHandling");

const   port                    =   process.env.PORT || 8080;

// Inizializzazione server
const   server                  =   express();
        // Configurazione middleware per files statici
        server.use(express.static("public"));
        // Configurazione middlewares per i body parsers
        server.use(express.json());
        server.use(express.urlencoded({ extended : true }));
        // Definizione rotte
        server.get("/", homePageController);
        server.use("/events", routerEvents);
        // Configurazione middleware per "Route not found"
        server.use(middlewareRouteNotFound);
        // Configurazione middleware per gestione errori
        server.use(middlewareErrorHandling);

        server.listen( port, () =>
        {
            // Importazione modello
            const EventModel = require("./models/EventModel");
            // In funzione del contenuto della specifica variabile nel .env, si connette il database (file json) al corrispondente modello, in modo da istanziare tutti gli eventi preesistenti
            if (process.env.DB_ON_START == "connect_json_to_model")
                EventModel.connectModelToDB();
            console.log(`Server in esecuzione su ${process.env.HOST}${port}`);
        });
