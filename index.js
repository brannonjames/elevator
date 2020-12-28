module.exports = {
    init(elevators, floors) {
        const elevator = elevators[0]; // Let's use the first elevator
        
        this.addFloorListeners(floors, elevator);
        this.addElevatorListeners(elevator);

    },
    addFloorListeners(floors, elevator) {
      // add listeners to each floor
      floors.forEach(floor => {
        //
        floor.on("up_button_pressed", () => {
            this.updateDestinationQueue(elevator, floor.floorNum());
        });
        //
        floor.on("down_button_pressed", () => {
            this.updateDestinationQueue(elevator, floor.floorNum());
        });
        //
    });
    //
    },
    addElevatorListeners(elevator) {
      //
      elevator.on("floor_button_pressed", (floorNum) => {
        this.updateDestinationQueue(elevator, floorNum);
    });
    //
    },
    // anytime a floor number is pressed we can and it to the destination queue to automatically bring the elevator there
    updateDestinationQueue(elevator, floorNum) {
        elevator.destinationQueue.push(floorNum);
        elevator.checkDestinationQueue();
    },    
    //  
    update(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}