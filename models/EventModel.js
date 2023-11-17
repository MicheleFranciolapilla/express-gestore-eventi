// Importazione librerie
const   fileSystem  =   require("fs");
const   path        =   require("path");

// Definizione del database (.json)
const   eventsDB    =   "eventsDB.json";

// Implementazione classe EventModel
class   EventModel
{
    // Proprietà private

    #id;
    #title;
    #titleSlug;
    #description;
    #date;
    #maxSeats;

    // Proprietà statiche

    static  eventsInDB  =   0; 
    static  someError   =   0;
    static  errors      =   ["Nessun errore", "File inesistente", "Formato file errato", "Evento rigettato"];

    // Costruttore e metodi

    // Per il momento stabiliamo che gli unici attributi indispensabili per la creazione di un nuovo evento siano il titolo, la data ed il numero di posti a sedere
    // L'id lo genereremo automaticamente di modo che sia univoco, mentre la descrizione dell'evento verrà settata in seguito (opzionale)
    constructor(_title, _date, _maxSeats)
    {
        this.#setUniqueId();
        this.title      =   _title;
        this.date       =   _date;
        this.maxSeats   =   _maxSeats;
        if (EventModel.addEvent(this.#id, this.#title, this.#date, this.#maxSeats))
            EventModel.eventsInDB++;
        else
            // Nel caso la creazione dell'evento non sia andata a buon fine si solleva un'eccezione che verrà poi intercettata dall'apposito middleware
            throw new Error(EventModel.errors[EventModel.someError]);
    }

    // Metodi private
    #setUniqueId()
    {
        let allEvents = EventModel.getAllEvents();
        const errorOnDB = EventModel.someError;
        // Se il file è corrotto o inesistente lo si ricrea/crea come file vuoto
        if ((errorOnDB == 1) || (errorOnDB == 2))
        {
            fileSystem.writeFileSync(path.resolve("public", eventsDB), "");
            EventModel.someError = 0;
            allEvents = [];
        }
        const allIds = allEvents.map( (event) => event.id );
        this.#id = allIds.length != 0 ? Math.max(...allIds) + 1 : 1;
    }

    // Metodi statici
    static  checkDBExistance()
    {
        return fileSystem.existsSync(path.resolve("public", eventsDB));
    }

    static  getAllEvents()
            {
                if (!fileSystem.existsSync(path.resolve("public", eventsDB)))
                {
                    EventModel.someError = 1;
                    console.log("Errore: ", EventModel.errors[EventModel.someError]);
                    return null;
                }
                else
                {
                    const fileContent = fileSystem.readFileSync(path.resolve("public", eventsDB), "utf-8");
                    if (fileContent == "")
                    {
                        EventModel.someError = 0;
                        console.log("Errore: ", EventModel.errors[EventModel.someError]);
                        return [];
                    }
                    else
                    {
                        let jsonFileData = null;
                        try
                        {
                            jsonFileData = JSON.parse(fileContent);
                        }
                        catch(error)
                        {
                            EventModel.someError = 2;
                            console.log("Errore: ", EventModel.errors[EventModel.someError]);
                            return null;
                        }
                        EventModel.someError = 0;
                        console.log("Errore: ", EventModel.errors[EventModel.someError]);
                        return jsonFileData;
                    }
                }
            } 

    static  addEvent(_id, _title, _date, _maxSeats)
    {
        const   eventToAdd  =   {
                                    "id"        :   _id,
                                    "title"     :   _title,
                                    "date"      :   _date,
                                    "maxSeats"  :   _maxSeats
                                };
        try
        {
            fileSystem.writeFileSync(path.resolve("public", eventsDB), JSON.stringify(eventToAdd));
        }
        catch (error)
        {
            EventModel.someError = 3;
            console.log("Errore: ", EventModel.errors[EventModel.someError]);
            return false;
        }
        EventModel.someError = 0;
        console.log("Errore: ", EventModel.errors[EventModel.someError]);
        return true;
    }
}

module.exports = EventModel;