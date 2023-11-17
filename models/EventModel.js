// Importazione librerie
const   fileSystem      =   require("fs");
const   path            =   require("path");

// Definizione del database (.json)
const   eventsDB        =   "eventsDB.json";
const   eventsDBPath    =   path.resolve("public", eventsDB);

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
        this.#title     =   _title;
        this.#date      =   _date;
        this.#maxSeats  =   _maxSeats;
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
            fileSystem.writeFileSync(eventsDBPath, "");
            EventModel.someError = 0;
            allEvents = [];
        }
        const allIds = allEvents.map( (event) => event.id );
        this.#id = allIds.length != 0 ? Math.max(...allIds) + 1 : 1;
    }

    // Metodi statici
    static  checkDBExistance()
    {
        return fileSystem.existsSync(eventsDBPath);
    }

    static  fromObjToArray(objToArray)
    {
        const simpleObj = objToArray;
        let arrayToReturn = [];
        arrayToReturn.push(simpleObj);
        return arrayToReturn;
    }

    static  getAllEvents()
            {
                if (!EventModel.checkDBExistance())
                {
                    console.log("file non esiste");
                    EventModel.someError = 1;
                    console.log("Errore: ", EventModel.errors[EventModel.someError]);
                    return null;
                }
                else
                {
                    console.log("file esiste");
                    const fileContent = fileSystem.readFileSync(eventsDBPath, "utf-8");
                    if (fileContent == "")
                    {
                        console.log("file senza contenuto.....restituisco array vuoto");
                        EventModel.someError = 0;
                        console.log("Errore: ", EventModel.errors[EventModel.someError]);
                        return [];
                    }
                    else
                    {
                        console.log("file con contenuto");
                        let jsonFileData = null;
                        try
                        {
                            jsonFileData = JSON.parse(fileContent);
                            console.log("tento il parsing in formato json....... ", jsonFileData);
                        }
                        catch(error)
                        {
                            EventModel.someError = 2;
                            console.log("Errore: ", EventModel.errors[EventModel.someError]);
                            return null;
                        }
                        console.log("Nessun errore nel parsing");
                        if (!Array.isArray(jsonFileData))
                        {
                            console.log("jsonfiledata non è un array.... ");
                            jsonFileData = EventModel.fromObjToArray(jsonFileData);
                            // const simpleObj = jsonFileData;
                            // jsonFileData = [];
                            // jsonFileData = Array.from(jsonFileData);
                            console.log("jsonfiledata ora è un array.... ", jsonFileData);
                        }
                        EventModel.someError = 0;
                        console.log("Errore: ", EventModel.errors[EventModel.someError]);
                        return jsonFileData;
                    }
                }
            } 

    static  getEvent(eventId)
    {

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
            fileSystem.writeFileSync(eventsDBPath, JSON.stringify(eventToAdd));
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