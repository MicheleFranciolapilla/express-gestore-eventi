// Importazione express e istanziazione di router
const   express             =   require("express");
const   router              =   express.Router();

// Importazione controller
const   eventsController    =   require("../controllers/eventsController");

// Definizione rotte relative a "/events"
router.get("/", eventsController.index);
router.get("/:event", eventsController.show);
router.post("/", eventsController.store);
router.put("/:event", eventsController.update);

module.exports = router;