const points = (state = [], action) => {
	switch (action.type) {
		case "SET_POINTS":
			return action.Points;
		default:
			return state;
	}
};

export default points