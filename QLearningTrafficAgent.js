// Q-Learning Traffic Management Agent
export class QLearningAgent {
  constructor() {
    this.qTable = new Map(); // State-action Q-values
    this.learningRate = 0.3; // Faster learning
    this.discountFactor = 0.98; // Value future rewards more
    this.explorationRate = 0.2; // Start with less exploration
    this.minExplorationRate = 0.01;
    this.explorationDecay = 0.99; // Decay faster to exploitation
    this.episodeCount = 0;
    this.totalReward = 0;
  }

  // Get state representation for a traffic light
  getState(light, vehicles) {
    const nearbyVehicles = vehicles.filter(v => {
      const dist = Math.sqrt((light.x - v.x) ** 2 + (light.y - v.y) ** 2);
      return dist < 100;
    });

    const waitingCount = nearbyVehicles.filter(v => v.speed < 0.1).length;
    const movingCount = nearbyVehicles.length - waitingCount;
    const avgWaitTime = nearbyVehicles.length > 0
      ? nearbyVehicles.reduce((sum, v) => sum + v.waitTime, 0) / nearbyVehicles.length
      : 0;

    // Discretize state
    const state = `${light.name}_${light.state}_${Math.floor(waitingCount / 3)}_${Math.floor(movingCount / 3)}_${Math.floor(avgWaitTime / 10)}`;
    return state;
  }

  // Get Q-value for state-action pair
  getQValue(state, action) {
    const key = `${state}_${action}`;
    return this.qTable.get(key) || 0;
  }

  // Set Q-value for state-action pair
  setQValue(state, action, value) {
    const key = `${state}_${action}`;
    this.qTable.set(key, value);
  }

  // Choose action using epsilon-greedy policy
  chooseAction(state) {
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      return Math.random() < 0.5 ? 'extend' : 'shorten';
    } else {
      // Exploit: best known action
      const extendQ = this.getQValue(state, 'extend');
      const shortenQ = this.getQValue(state, 'shorten');
      return extendQ > shortenQ ? 'extend' : 'shorten';
    }
  }

  // Calculate reward based on traffic conditions - Heavily penalize congestion
  calculateReward(beforeWaiting, afterWaiting, beforeMoving, afterMoving) {
    const waitingImprovement = beforeWaiting - afterWaiting;
    const flowImprovement = afterMoving - beforeMoving;
    
    // Heavy penalty for any waiting vehicles
    const congestionPenalty = afterWaiting * -5;
    
    // Big reward for moving vehicles
    const flowReward = afterMoving * 3;
    
    // Bonus for reducing waiting vehicles
    const improvementBonus = waitingImprovement * 10;
    
    return improvementBonus + flowReward + congestionPenalty;
  }

  // Update Q-value using Q-learning algorithm
  update(state, action, reward, nextState) {
    const currentQ = this.getQValue(state, action);
    const maxNextQ = Math.max(
      this.getQValue(nextState, 'extend'),
      this.getQValue(nextState, 'shorten')
    );

    // Q-learning update rule
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    this.setQValue(state, action, newQ);

    this.totalReward += reward;
    this.episodeCount++;

    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );
  }

  getStats() {
    return {
      iterations: this.episodeCount,
      avgReward: this.episodeCount > 0 ? this.totalReward / this.episodeCount : 0,
      epsilon: this.explorationRate,
      qTableSize: this.qTable.size
    };
  }
}
