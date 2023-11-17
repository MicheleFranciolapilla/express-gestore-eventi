// Implementazione classe Event
class   Event
{
    // Proprietà private
    #id;
    #title;
    #description;
    #date;
    #maxSeats;

    // Costruttore e metodi
    // Per il momento stabiliamo che gli unici attributi indispensabili per la creazione di un nuovo evento siano il titolo, la data ed il numero di posti a sedere
    // L'id lo genereremo automaticamente di modo che sia univoco, mentre la descrizione dell'evento verrà settata in seguito (opzionale)
    constructor(_title, _date, _maxSeats)
    {
        this.title      =   _title;
        this.date       =   _date;
        this.maxSeats   =   _maxSeats;
    }
}