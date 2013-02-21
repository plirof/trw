Game.AI = function(being) {
	this._being = being;
}

Game.AI.prototype.act = function() {
	var tasks = this._being.getTasks();
	var i = tasks.length;
	if (!i) { return; }

	while (i--) {
		var result = this._performTask(tasks[i]);
		if (result) { return; }
	}
}

/**
 * @returns {bool} Successfull
 */
Game.AI.prototype._performTask = function(task) {
	switch (task) {
		case "wander":
			return this._wander();
		break;
		case "attack":
			return this._attack();
		break;
		default: 
			throw new Error("Unknown task '"+task+"'");
		break;
	}
	
}

Game.AI.prototype._wander = function() {
	var level = this._being.getLevel();
	var pos = this._being.getPosition();
	var dirs = ROT.DIRS[8];
	var avail = [];

	for (var i=0;i<dirs.length;i++) {
		var x = pos[0]+dirs[i][0];
		var y = pos[1]+dirs[i][1];
		if (this._isPassable(level, x, y)) { avail.push(dirs[i]); }
	}

	if (avail.length) {
		var dir = avail.random();
		var x = pos[0]+dir[0];
		var y = pos[1]+dir[1];
		level.setBeing(this._being, x, y);
	}
	return true;
}

Game.AI.prototype._attack = function() {
	var level = this._being.getLevel();
	var thisPosition = this._being.getPosition();
	var targetPosition = Game.player.getPosition();

	var dist = this._distance(thisPosition[0], thisPosition[1], targetPosition[0], targetPosition[1]);

	if (dist > this._being.getSightRange()) { return false; }

	if (dist == 1) {
		this._being.attack(Game.player);
		return true;
	}

	var bestDist = 1/0;
	var avail = [];
	var dirs = ROT.DIRS[8];
	for (var i=0;i<dirs.length;i++) {
		var dir = dirs[i];
		var x = thisPosition[0]+dir[0];
		var y = thisPosition[1]+dir[1];
		if (!this._isPassable(level, x, y)) { continue; }
		var dist = this._distance(x, y, targetPosition[0], targetPosition[1]);
		if (dist < bestDist) {
			avail = [];
			bestDist = dist;
		}
		if (dist == bestDist) { avail.push([x, y]); }
	}
	if (!avail.length) { return true; }

	var pos = avail.random();
	level.setBeing(this._being, pos[0], pos[1]);

	return true;
}

Game.AI.prototype._distance = function(x1, y1, x2, y2) {
	return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
}

Game.AI.prototype._isPassable = function(level, x, y) {
	var key = x+","+y;
	if (key in level.beings) { return false; }
	
	var cell = level.cells[key];
	if (!cell) { return false; }
	
	return !cell.blocksMovement();
}
