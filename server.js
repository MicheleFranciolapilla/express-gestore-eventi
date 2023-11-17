// Importazione librerie
const   dotenv              =   require("dotenv").config();
const   express             =   require("express");

// Importazione controllers
const   homePageController  =   require("./controllers/homePageController");

// Importazione routers
const   routerEvents        =   require("./routers/routerEvents");

const   port                =   process.env.PORT || 8080;

// Inizializzazione server
const   server              =   express();
        // Configurazione middleware per files statici
        server.use(express.static("public"));
        // Configurazione middlewares per i body parsers
        server.use(express.json());
        server.use(express.urlencoded({ extended : true }));
        // Definizione rotte
        server.get("/", homePageController);
        server.use("/events", routerEvents);

        server.listen( port, () =>
        {
            const EventModel = require("./models/EventModel");
            const myEventModel = new EventModel("titolo", "description", new Date(), "posti");
            console.log(myEventModel);
            console.log("Eventi totali: ",EventModel.eventsInDB());
            console.log(`Server in esecuzione su ${process.env.HOST}${port}`);
        });
