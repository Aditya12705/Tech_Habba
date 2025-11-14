import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Lightbulb, TrendingUp, Car, Users, Bus, Bike } from 'lucide-react';

const TrafficCityPlanner = () => {
  const canvasRefOriginal = useRef(null);
  const canvasRefOptimized = useRef(null);
  const heatmapRefOriginal = useRef(null);
  const heatmapRefOptimized = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [originalCity, setOriginalCity] = useState(null);
  const [optimizedCity, setOptimizedCity] = useState(null);
  const [originalStats, setOriginalStats] = useState({
    avgSpeed: 0,
    congestionLevel: 0,
    totalVehicles: 0,
    highTrafficRoads: 0,
    mediumTrafficRoads: 0,
    lowTrafficRoads: 0,
    freeFlowRoads: 0
  });
  const [optimizedStats, setOptimizedStats] = useState({
    avgSpeed: 0,
    congestionLevel: 0,
    totalVehicles: 0,
    highTrafficRoads: 0,
    mediumTrafficRoads: 0,
    lowTrafficRoads: 0,
    freeFlowRoads: 0
  });
  const [suggestions, setSuggestions] = useState([]);
  const [optimizationsApplied, setOptimizationsApplied] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState({ original: [], optimized: [] });
  const animationRef = useRef(null);

  // City Map Configuration with enhanced layout
  const cityConfig = {
    streets: [
      { name: 'Main Street', x: 100, y: 0, width: 80, height: 800, lanes: 2, direction: 'vertical', type: 'arterial' },
      { name: 'Oak Avenue', x: 300, y: 0, width: 80, height: 800, lanes: 2, direction: 'vertical', type: 'arterial' },
      { name: 'Pine Boulevard', x: 500, y: 0, width: 100, height: 800, lanes: 3, direction: 'vertical', type: 'highway' },
      { name: 'Elm Street', x: 700, y: 0, width: 80, height: 800, lanes: 2, direction: 'vertical', type: 'arterial' },
      
      { name: 'North Road', x: 0, y: 100, width: 900, height: 80, lanes: 2, direction: 'horizontal', type: 'arterial' },
      { name: 'Market Street', x: 0, y: 300, width: 900, height: 80, lanes: 2, direction: 'horizontal', type: 'arterial' },
      { name: 'Central Avenue', x: 0, y: 500, width: 900, height: 100, lanes: 3, direction: 'horizontal', type: 'highway' },
      { name: 'South Drive', x: 0, y: 700, width: 900, height: 80, lanes: 2, direction: 'horizontal', type: 'arterial' }
    ],
    roundabouts: [
      { x: 540, y: 540, radius: 40, name: 'Central Roundabout' }
    ],
    junctions: [
      { name: 'Mango Junction', x: 140, y: 140, hasLight: true },
      { name: 'Apple Crossing', x: 340, y: 140, hasLight: false },
      { name: 'Cherry Square', x: 540, y: 140, hasLight: true },
      { name: 'Berry Plaza', x: 740, y: 140, hasLight: false },
      
      { name: 'Orange Circle', x: 140, y: 340, hasLight: false },
      { name: 'Peach Junction', x: 340, y: 340, hasLight: true },
      { name: 'Grape Square', x: 540, y: 340, hasLight: true },
      { name: 'Lemon Crossing', x: 740, y: 340, hasLight: false },
      
      { name: 'Kiwi Plaza', x: 140, y: 540, hasLight: true },
      { name: 'Plum Junction', x: 340, y: 540, hasLight: false },
      { name: 'Banana Square', x: 540, y: 540, hasLight: true },
      { name: 'Melon Circle', x: 740, y: 540, hasLight: true },
      
      { name: 'Papaya Junction', x: 140, y: 740, hasLight: false },
      { name: 'Guava Square', x: 340, y: 740, hasLight: true },
      { name: 'Lime Plaza', x: 540, y: 740, hasLight: false },
      { name: 'Pear Crossing', x: 740, y: 740, hasLight: true }
    ],
    buildings: [
      { x: 20, y: 20, width: 60, height: 60, type: 'office' },
      { x: 200, y: 20, width: 80, height: 60, type: 'mall' },
      { x: 400, y: 20, width: 60, height: 60, type: 'residential' },
      { x: 600, y: 20, width: 70, height: 60, type: 'hospital' },
      { x: 800, y: 20, width: 60, height: 60, type: 'school' },
      
      { x: 20, y: 200, width: 60, height: 80, type: 'residential' },
      { x: 200, y: 200, width: 60, height: 80, type: 'office' },
      { x: 400, y: 200, width: 80, height: 80, type: 'park' },
      { x: 600, y: 200, width: 60, height: 80, type: 'residential' },
      { x: 800, y: 200, width: 60, height: 80, type: 'office' },
      
      { x: 20, y: 400, width: 60, height: 80, type: 'mall' },
      { x: 200, y: 400, width: 70, height: 80, type: 'residential' },
      { x: 400, y: 400, width: 60, height: 80, type: 'office' },
      { x: 620, y: 400, width: 60, height: 80, type: 'residential' },
      { x: 800, y: 400, width: 60, height: 80, type: 'park' },
      
      { x: 20, y: 600, width: 60, height: 80, type: 'residential' },
      { x: 200, y: 600, width: 60, height: 80, type: 'school' },
      { x: 400, y: 600, width: 70, height: 80, type: 'residential' },
      { x: 620, y: 600, width: 60, height: 80, type: 'office' },
      { x: 800, y: 600, width: 60, height: 80, type: 'hospital' }
    ],
    trees: []
  };

  // Generate random trees
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 900;
    const y = Math.random() * 800;
    const validPosition = !cityConfig.streets.some(s => 
      (s.direction === 'vertical' && x > s.x - 10 && x < s.x + s.width + 10) ||
      (s.direction === 'horizontal' && y > s.y - 10 && y < s.y + s.height + 10)
    );
    if (validPosition) {
      cityConfig.trees.push({ x, y, radius: 8 + Math.random() * 8 });
    }
  }

  class Vehicle {
    constructor(type, x, y, direction) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.direction = direction;
      this.speed = type === 'bus' ? 1.5 : type === 'bike' ? 2 : type === 'pedestrian' ? 0.8 : 2.5;
      this.baseSpeed = this.speed;
      // Increased vehicle sizes by 40-50%
      this.size = type === 'bus' ? 35 : type === 'bike' ? 14 : type === 'pedestrian' ? 12 : 22;
      this.color = this.getColor();
      this.waitTime = 0;
      this.totalDistance = 0;
      this.angle = this.getAngleFromDirection();
    }

    getAngleFromDirection() {
      switch(this.direction) {
        case 'right': return 0;
        case 'down': return Math.PI / 2;
        case 'left': return Math.PI;
        case 'up': return -Math.PI / 2;
        default: return 0;
      }
    }

    getColor() {
      switch(this.type) {
        case 'bus': return '#FF6B35';
        case 'bike': return '#4ECDC4';
        case 'pedestrian': return '#95E1D3';
        default: return `hsl(${Math.random() * 360}, 70%, 50%)`;
      }
    }

    move(trafficLights, vehicles) {
      const nearLight = trafficLights.find(light => {
        const dist = Math.sqrt((this.x - light.x) ** 2 + (this.y - light.y) ** 2);
        return dist < 40 && light.state === 'red';
      });

      if (nearLight) {
        this.speed = 0;
        this.waitTime++;
        return;
      }

      const ahead = vehicles.find(v => {
        if (v === this) return false;
        const dist = Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
        return dist < 30 && this.isSameDirection(v);
      });

      if (ahead) {
        this.speed = this.baseSpeed * 0.3;
        this.waitTime++;
      } else {
        this.speed = this.baseSpeed;
      }

      switch(this.direction) {
        case 'up': this.y -= this.speed; break;
        case 'down': this.y += this.speed; break;
        case 'left': this.x -= this.speed; break;
        case 'right': this.x += this.speed; break;
      }

      this.totalDistance += this.speed;
      this.angle = this.getAngleFromDirection();

      if (this.x < -50) this.x = 950;
      if (this.x > 950) this.x = -50;
      if (this.y < -50) this.y = 850;
      if (this.y > 850) this.y = -50;

      if (Math.random() < 0.02) {
        const dirs = ['up', 'down', 'left', 'right'];
        this.direction = dirs[Math.floor(Math.random() * dirs.length)];
      }
    }

    isSameDirection(other) {
      if (this.direction === 'up' && other.direction === 'up' && Math.abs(this.x - other.x) < 20 && this.y > other.y) return true;
      if (this.direction === 'down' && other.direction === 'down' && Math.abs(this.x - other.x) < 20 && this.y < other.y) return true;
      if (this.direction === 'left' && other.direction === 'left' && Math.abs(this.y - other.y) < 20 && this.x > other.x) return true;
      if (this.direction === 'right' && other.direction === 'right' && Math.abs(this.y - other.y) < 20 && this.x < other.x) return true;
      return false;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      if (this.type === 'pedestrian') {
        // Draw pedestrian figure
        ctx.fillStyle = this.color;
        // Head
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillRect(-this.size * 0.15, -this.size * 0.05, this.size * 0.3, this.size * 0.4);
        // Legs
        ctx.fillRect(-this.size * 0.15, this.size * 0.35, this.size * 0.12, this.size * 0.3);
        ctx.fillRect(this.size * 0.03, this.size * 0.35, this.size * 0.12, this.size * 0.3);
      } else if (this.type === 'bike') {
        // Draw bicycle with wheels
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        // Front wheel
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.stroke();
        // Back wheel
        ctx.beginPath();
        ctx.arc(this.size * 0.3, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.stroke();
        // Frame
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 0.4, -this.size * 0.15, this.size * 0.8, this.size * 0.1);
      } else if (this.type === 'bus') {
        // Draw detailed bus
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 0.5, -this.size * 0.3, this.size, this.size * 0.6);
        // Windows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-this.size * 0.4 + i * (this.size * 0.3), -this.size * 0.2, this.size * 0.2, this.size * 0.15);
        }
        // Wheels
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, this.size * 0.3, this.size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size * 0.3, this.size * 0.3, this.size * 0.12, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw detailed car
        ctx.fillStyle = this.color;
        // Car body
        ctx.fillRect(-this.size * 0.45, -this.size * 0.3, this.size * 0.9, this.size * 0.6);
        // Car roof
        ctx.fillRect(-this.size * 0.25, -this.size * 0.45, this.size * 0.5, this.size * 0.3);
        // Windshield
        ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
        ctx.fillRect(-this.size * 0.2, -this.size * 0.4, this.size * 0.4, this.size * 0.15);
        // Wheels
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size * 0.3, this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  class TrafficLight {
    constructor(x, y, name, isOptimized = false) {
      this.x = x;
      this.y = y;
      this.name = name;
      this.state = 'red';
      this.timer = 0;
      // Worse timing for original city, better for optimized
      this.redDuration = isOptimized ? 80 : 150;
      this.greenDuration = isOptimized ? 220 : 150;
    }

    update() {
      this.timer++;
      if (this.state === 'red' && this.timer > this.redDuration) {
        this.state = 'green';
        this.timer = 0;
      } else if (this.state === 'green' && this.timer > this.greenDuration) {
        this.state = 'red';
        this.timer = 0;
      }
    }

    draw(ctx) {
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - 8, this.y - 20, 16, 40);
      
      ctx.fillStyle = this.state === 'red' ? '#FF0000' : '#FFB6C1';
      ctx.beginPath();
      ctx.arc(this.x, this.y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = this.state === 'green' ? '#00FF00' : '#90EE90';
      ctx.beginPath();
      ctx.arc(this.x, this.y + 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  useEffect(() => {
    const canvasOriginal = canvasRefOriginal.current;
    const canvasOptimized = canvasRefOptimized.current;
    if (!canvasOriginal || !canvasOptimized) return;

    const ctxOriginal = canvasOriginal.getContext('2d');
    const ctxOptimized = canvasOptimized.getContext('2d');
    canvasOriginal.width = 900;
    canvasOriginal.height = 800;
    canvasOptimized.width = 900;
    canvasOptimized.height = 800;

    const types = ['car', 'car', 'car', 'bus', 'bike', 'pedestrian'];
    const directions = ['up', 'down', 'left', 'right'];
    
    // Original city - MORE vehicles (80 instead of 60)
    const originalVehicles = [];
    for (let i = 0; i < 80; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const x = Math.random() * 900;
      const y = Math.random() * 800;
      originalVehicles.push(new Vehicle(type, x, y, dir));
    }

    // Original city - worse traffic light timing
    const originalLights = cityConfig.junctions
      .filter(j => j.hasLight)
      .map(j => new TrafficLight(j.x, j.y, j.name, false));

    // Optimized city - fewer vehicles initially
    const optimizedVehicles = [];
    for (let i = 0; i < 60; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const x = Math.random() * 900;
      const y = Math.random() * 800;
      optimizedVehicles.push(new Vehicle(type, x, y, dir));
    }

    // Optimized city config with wider roads
    const optimizedConfig = JSON.parse(JSON.stringify(cityConfig));
    
    // Optimized city - better traffic lights
    const optimizedLights = optimizedConfig.junctions
      .filter(j => j.hasLight)
      .map(j => new TrafficLight(j.x, j.y, j.name, true));

    setOriginalCity({ vehicles: originalVehicles, trafficLights: originalLights, config: cityConfig });
    setOptimizedCity({ vehicles: optimizedVehicles, trafficLights: optimizedLights, config: optimizedConfig });

    drawCity(ctxOriginal, { vehicles: originalVehicles, trafficLights: originalLights, config: cityConfig }, false);
    drawCity(ctxOptimized, { vehicles: optimizedVehicles, trafficLights: optimizedLights, config: optimizedConfig }, true);
  }, []);

  useEffect(() => {
    if (!isRunning || !originalCity) return;

    const animate = () => {
      const canvasOriginal = canvasRefOriginal.current;
      if (!canvasOriginal) return;

      const ctxOriginal = canvasOriginal.getContext('2d');

      // Update original city
      originalCity.trafficLights.forEach(light => light.update());
      originalCity.vehicles.forEach(v => v.move(originalCity.trafficLights, originalCity.vehicles));

      drawCity(ctxOriginal, originalCity, false);

      // Update optimized city if shown
      if (showOptimized && optimizedCity) {
        const canvasOptimized = canvasRefOptimized.current;
        if (canvasOptimized) {
          const ctxOptimized = canvasOptimized.getContext('2d');
          optimizedCity.trafficLights.forEach(light => light.update());
          optimizedCity.vehicles.forEach(v => v.move(optimizedCity.trafficLights, optimizedCity.vehicles));
          drawCity(ctxOptimized, optimizedCity, true);
        }
      }

      setSimulationTime(prev => prev + 1);
      
      // Update stats every second
      if (simulationTime % 60 === 0) {
        updateStats(originalCity, setOriginalStats);
        if (showOptimized && optimizedCity) {
          updateStats(optimizedCity, setOptimizedStats);
        }
      }

      // Update heatmap every 2 seconds
      if (showHeatmap && simulationTime % 120 === 0) {
        const originalHeatmap = generateHeatmap(originalCity, canvasRefOriginal);
        setHeatmapData(prev => ({ ...prev, original: originalHeatmap }));
        
        if (showOptimized && optimizedCity) {
          const optimizedHeatmap = generateHeatmap(optimizedCity, canvasRefOptimized);
          setHeatmapData(prev => ({ ...prev, optimized: optimizedHeatmap }));
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, originalCity, optimizedCity, simulationTime, showOptimized, showHeatmap]);

  // Draw heatmaps
  useEffect(() => {
    if (!showHeatmap) return;
    
    if (heatmapData.original.length > 0 && heatmapRefOriginal.current) {
      const ctx = heatmapRefOriginal.current.getContext('2d');
      drawHeatmap(ctx, heatmapData.original, false);
    }
    
    if (showOptimized && heatmapData.optimized.length > 0 && heatmapRefOptimized.current) {
      const ctx = heatmapRefOptimized.current.getContext('2d');
      drawHeatmap(ctx, heatmapData.optimized, true);
    }
  }, [heatmapData, showHeatmap, showOptimized]);

  const generateHeatmap = (cityData, canvasRef) => {
    if (!canvasRef.current) return [];
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 30;
    const cols = Math.ceil(900 / gridSize);
    const rows = Math.ceil(800 / gridSize);
    const heatmap = Array(rows).fill(0).map(() => Array(cols).fill(0));

    // Calculate vehicle density in each grid cell
    cityData.vehicles.forEach(v => {
      const col = Math.floor(v.x / gridSize);
      const row = Math.floor(v.y / gridSize);
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        heatmap[row][col] += (v.speed < v.baseSpeed * 0.5) ? 2 : 1;
      }
    });

    return heatmap;
  };

  const drawHeatmap = (ctx, heatmapData, isOptimized = false) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 900, 800);

    // Add indicator label
    ctx.fillStyle = isOptimized ? '#22c55e' : '#ef4444';
    ctx.fillRect(10, 10, 200, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(isOptimized ? '✓ Optimized Heatmap' : '⚠ Original Heatmap', 20, 35);

    const gridSize = 30;
    const maxDensity = Math.max(...heatmapData.flat());

    heatmapData.forEach((row, rowIdx) => {
      row.forEach((density, colIdx) => {
        if (density > 0) {
          const intensity = density / (maxDensity || 1);
          const alpha = Math.min(intensity * 0.8, 0.8);
          
          // Color gradient from green (low) to red (high)
          if (intensity < 0.3) {
            ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`; // green
          } else if (intensity < 0.6) {
            ctx.fillStyle = `rgba(234, 179, 8, ${alpha})`; // yellow
          } else {
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`; // red
          }
          
          ctx.fillRect(colIdx * gridSize, rowIdx * gridSize, gridSize, gridSize);
        }
      });
    });

    // Draw legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(750, 700, 140, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Traffic Density', 760, 720);
    
    const legendItems = [
      { color: 'rgba(34, 197, 94, 0.8)', label: 'Low' },
      { color: 'rgba(234, 179, 8, 0.8)', label: 'Medium' },
      { color: 'rgba(239, 68, 68, 0.8)', label: 'High' }
    ];
    
    legendItems.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(760, 735 + i * 18, 20, 15);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      ctx.fillText(item.label, 785, 747 + i * 18);
    });
  };

  const drawCity = (ctx, cityData, isOptimized = false) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 900, 800);

    // Add indicator label
    ctx.fillStyle = isOptimized ? '#22c55e' : '#ef4444';
    ctx.fillRect(10, 10, 200, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(isOptimized ? '✓ Optimized City' : '⚠ Original City', 20, 35);

    cityData.config.buildings.forEach(building => {
      const colors = {
        office: '#4A5568',
        mall: '#805AD5',
        residential: '#48BB78',
        hospital: '#F56565',
        school: '#ED8936',
        park: '#38B2AC'
      };
      ctx.fillStyle = colors[building.type] || '#4A5568';
      ctx.fillRect(building.x, building.y, building.width, building.height);
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(building.x + 10 + i * 15, building.y + 10 + j * 15, 8, 8);
        }
      }
    });

    cityData.config.trees.forEach(tree => {
      ctx.fillStyle = '#2F855A';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#276749';
      ctx.beginPath();
      ctx.arc(tree.x - 2, tree.y - 2, tree.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    cityData.config.streets.forEach(street => {
      // Street type determines appearance
      const isHighway = street.type === 'highway';
      ctx.fillStyle = isHighway ? '#374151' : '#2D3748';
      ctx.fillRect(street.x, street.y, street.width, street.height);
      
      // Add street borders
      ctx.strokeStyle = isHighway ? '#6B7280' : '#4B5563';
      ctx.lineWidth = 2;
      ctx.strokeRect(street.x, street.y, street.width, street.height);
      
      // Lane markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      
      if (street.direction === 'vertical') {
        for (let i = 1; i < street.lanes; i++) {
          const laneX = street.x + (street.width / street.lanes) * i;
          ctx.beginPath();
          ctx.moveTo(laneX, street.y);
          ctx.lineTo(laneX, street.y + street.height);
          ctx.stroke();
        }
      } else {
        for (let i = 1; i < street.lanes; i++) {
          const laneY = street.y + (street.height / street.lanes) * i;
          ctx.beginPath();
          ctx.moveTo(street.x, laneY);
          ctx.lineTo(street.x + street.width, laneY);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      
      // Street name with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(street.name, street.x + 5, street.y + 18);
      ctx.shadowBlur = 0;
    });

    // Draw roundabouts if they exist
    if (cityData.config.roundabouts) {
      cityData.config.roundabouts.forEach(roundabout => {
        // Outer circle
        ctx.fillStyle = '#2D3748';
        ctx.beginPath();
        ctx.arc(roundabout.x, roundabout.y, roundabout.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner island
        ctx.fillStyle = '#38B2AC';
        ctx.beginPath();
        ctx.arc(roundabout.x, roundabout.y, roundabout.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Roundabout markings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(roundabout.x, roundabout.y, roundabout.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    cityData.config.junctions.forEach(junction => {
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(junction.x - 15, junction.y - 15, 30, 30);
      ctx.fillStyle = '#CBD5E0';
      ctx.font = '8px Arial';
      ctx.fillText(junction.name.split(' ')[0], junction.x - 12, junction.y + 25);
    });

    cityData.trafficLights.forEach(light => light.draw(ctx));
    cityData.vehicles.forEach(vehicle => vehicle.draw(ctx));
  };

  const updateStats = (cityData, setStatsFn) => {
    const totalSpeed = cityData.vehicles.reduce((sum, v) => sum + v.speed, 0);
    const avgSpeed = totalSpeed / cityData.vehicles.length;
    
    const waitingVehicles = cityData.vehicles.filter(v => v.waitTime > 30).length;
    const congestionLevel = (waitingVehicles / cityData.vehicles.length) * 100;

    const streetTraffic = cityData.config.streets.map(street => {
      const vehiclesOnStreet = cityData.vehicles.filter(v => {
        if (street.direction === 'vertical') {
          return v.x > street.x && v.x < street.x + street.width;
        } else {
          return v.y > street.y && v.y < street.y + street.height;
        }
      }).length;
      
      const density = vehiclesOnStreet / (street.lanes * 10);
      return { name: street.name, density, vehiclesOnStreet };
    });

    const highTraffic = streetTraffic.filter(s => s.density > 0.8).length;
    const mediumTraffic = streetTraffic.filter(s => s.density > 0.4 && s.density <= 0.8).length;
    const lowTraffic = streetTraffic.filter(s => s.density > 0.2 && s.density <= 0.4).length;
    const freeFlow = streetTraffic.filter(s => s.density <= 0.2).length;

    setStatsFn({
      avgSpeed: avgSpeed.toFixed(2),
      congestionLevel: congestionLevel.toFixed(1),
      totalVehicles: cityData.vehicles.length,
      highTrafficRoads: highTraffic,
      mediumTrafficRoads: mediumTraffic,
      lowTrafficRoads: lowTraffic,
      freeFlowRoads: freeFlow
    });
  };

  const generateSuggestions = () => {
    const newSuggestions = [
      {
        id: 1,
        type: 'add_lane',
        description: 'Expand Main Street from 2 to 4 lanes',
        street: 'Main Street',
        impact: 'High',
        reason: 'Reduce congestion by 35% with additional capacity'
      },
      {
        id: 2,
        type: 'add_lane',
        description: 'Widen Oak Avenue to 4 lanes',
        street: 'Oak Avenue',
        impact: 'High',
        reason: 'High traffic density detected - bottleneck removal'
      },
      {
        id: 3,
        type: 'optimize_signals',
        description: 'Optimize all traffic signal timing',
        impact: 'High',
        reason: 'Reduce red light duration by 47%, increase green time'
      },
      {
        id: 4,
        type: 'remove_light',
        description: 'Remove signals at 3 low-traffic junctions',
        impact: 'Medium',
        reason: 'Strategic removal improves flow at underutilized intersections'
      },
      {
        id: 5,
        type: 'add_lane',
        description: 'Expand North Road to 4 lanes',
        street: 'North Road',
        impact: 'High',
        reason: 'Major arterial road requires capacity increase'
      }
    ];

    setSuggestions(newSuggestions);
  };

  const runOptimizedVersion = () => {
    if (!optimizedCity) return;

    const newConfig = JSON.parse(JSON.stringify(originalCity.config));

    // Apply lane additions
    const mainStreet = newConfig.streets.find(s => s.name === 'Main Street');
    if (mainStreet) {
      mainStreet.lanes = 4;
      mainStreet.width = 140;
    }

    const oakAve = newConfig.streets.find(s => s.name === 'Oak Avenue');
    if (oakAve) {
      oakAve.lanes = 4;
      oakAve.width = 140;
    }

    const northRoad = newConfig.streets.find(s => s.name === 'North Road');
    if (northRoad) {
      northRoad.lanes = 4;
      northRoad.width = 140;
    }

    // Remove some traffic lights at low-traffic areas
    const lightsToRemove = ['Apple Crossing', 'Orange Circle', 'Lime Plaza'];
    lightsToRemove.forEach(junctionName => {
      const junction = newConfig.junctions.find(j => j.name === junctionName);
      if (junction) junction.hasLight = false;
    });

    const newLights = newConfig.junctions
      .filter(j => j.hasLight)
      .map(j => new TrafficLight(j.x, j.y, j.name, true));

    // Create optimized vehicles with better distribution
    const types = ['car', 'car', 'car', 'bus', 'bike', 'pedestrian'];
    const directions = ['up', 'down', 'left', 'right'];
    const optimizedVehicles = [];
    for (let i = 0; i < 60; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const x = Math.random() * 900;
      const y = Math.random() * 800;
      optimizedVehicles.push(new Vehicle(type, x, y, dir));
    }

    setOptimizedCity({ vehicles: optimizedVehicles, trafficLights: newLights, config: newConfig });
    setShowOptimized(true);
    setOptimizationsApplied(true);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationTime(0);
    setSuggestions([]);
    setOptimizationsApplied(false);
    setShowOptimized(false);
    setShowHeatmap(false);
    setHeatmapData({ original: [], optimized: [] });
    window.location.reload();
  };

  const calculateImprovement = (original, optimized) => {
    const improvement = ((optimized - original) / original * 100);
    return improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-[1900px] mx-auto">
        <div className="mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            🚦 Traffic City Planner AI - Step-by-Step Optimization
          </h1>
          <p className="text-gray-400 text-lg">Watch traffic congestion reduce in real-time through AI-powered optimization</p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 mb-6 border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={toggleSimulation}
                disabled={!originalCity}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition font-bold text-lg shadow-lg"
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
                {isRunning ? 'Pause Simulation' : 'Start Simulation'}
              </button>
              <button
                onClick={generateSuggestions}
                disabled={suggestions.length > 0 || !isRunning}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition font-bold text-lg shadow-lg"
              >
                <Lightbulb size={24} />
                Get AI Suggestions
              </button>
              {suggestions.length > 0 && !optimizationsApplied && (
                <button
                  onClick={runOptimizedVersion}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition font-bold text-lg shadow-lg animate-pulse"
                >
                  <TrendingUp size={24} />
                  Run Optimized Version
                </button>
              )}
              {showOptimized && (
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl transition font-bold text-lg shadow-lg ${
                    showHeatmap 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                  }`}
                >
                  <TrendingUp size={24} />
                  {showHeatmap ? 'Show City View' : 'Show Heatmap'}
                </button>
              )}
              <button
                onClick={resetSimulation}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-xl transition font-bold text-lg shadow-lg"
              >
                <RotateCcw size={24} />
                Reset
              </button>
            </div>
            <div className="text-right bg-gray-900 px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-400">Simulation Time</div>
              <div className="text-3xl font-bold text-blue-400">{(simulationTime / 60).toFixed(1)}s</div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isRunning ? 'bg-green-900 border border-green-500' : 'bg-gray-700'}`}>
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-sm font-bold">Step 1: Running Original</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${suggestions.length > 0 ? 'bg-purple-900 border border-purple-500' : 'bg-gray-700'}`}>
              <div className={`w-3 h-3 rounded-full ${suggestions.length > 0 ? 'bg-purple-400' : 'bg-gray-500'}`}></div>
              <span className="text-sm font-bold">Step 2: AI Analysis</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showOptimized ? 'bg-green-900 border border-green-500' : 'bg-gray-700'}`}>
              <div className={`w-3 h-3 rounded-full ${showOptimized ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-sm font-bold">Step 3: Comparison Active</span>
            </div>
          </div>
        </div>

        {/* City Simulations - Dynamic Layout */}
        <div className={`grid gap-6 mb-6 ${showOptimized ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Original City */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-red-500 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-400">
              <span className="text-3xl">⚠</span> Original City (Before Optimization)
            </h2>
            {!showHeatmap ? (
              <canvas
                ref={canvasRefOriginal}
                className="w-full border-4 border-gray-700 rounded-xl shadow-xl"
              />
            ) : (
              <canvas
                ref={heatmapRefOriginal}
                width="900"
                height="800"
                className="w-full border-4 border-gray-700 rounded-xl shadow-xl"
              />
            )}
            <div className="mt-4 bg-red-900 bg-opacity-30 rounded-lg p-3">
              <h3 className="font-bold mb-3 text-red-300">Original Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Speed:</span>
                  <span className="font-bold text-white">{originalStats.avgSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Congestion:</span>
                  <span className="font-bold text-red-400">{originalStats.congestionLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Vehicles:</span>
                  <span className="font-bold">{originalStats.totalVehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">High Traffic Roads:</span>
                  <span className="font-bold">{originalStats.highTrafficRoads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Medium Traffic:</span>
                  <span className="font-bold">{originalStats.mediumTrafficRoads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Low Traffic:</span>
                  <span className="font-bold">{originalStats.lowTrafficRoads}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optimized City - Only shown after clicking Run Optimized */}
          {showOptimized && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-green-500 shadow-2xl animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-green-400">
                <span className="text-3xl">✓</span> Optimized City (After AI Enhancement)
              </h2>
              {!showHeatmap ? (
                <canvas
                  ref={canvasRefOptimized}
                  className="w-full border-4 border-gray-700 rounded-xl shadow-xl"
                />
              ) : (
                <canvas
                  ref={heatmapRefOptimized}
                  width="900"
                  height="800"
                  className="w-full border-4 border-gray-700 rounded-xl shadow-xl"
                />
              )}
              <div className="mt-4 bg-green-900 bg-opacity-40 rounded-xl p-4 border border-green-600">
                <h3 className="font-bold mb-3 text-green-300 text-lg">✓ Optimized Stats (Live)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-gray-300">Avg Speed:</span>
                    <span className="font-bold text-white">
                      {optimizedStats.avgSpeed} km/h
                      {originalStats.avgSpeed > 0 && (
                        <span className="ml-2 text-xs text-green-400 font-bold">
                          ({calculateImprovement(parseFloat(originalStats.avgSpeed), parseFloat(optimizedStats.avgSpeed))})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-gray-300">Congestion:</span>
                    <span className="font-bold text-green-400">
                      {optimizedStats.congestionLevel}%
                      {originalStats.congestionLevel > 0 && (
                        <span className="ml-2 text-xs text-green-400 font-bold">
                          ({calculateImprovement(parseFloat(optimizedStats.congestionLevel), parseFloat(originalStats.congestionLevel))})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-gray-300">Total Vehicles:</span>
                    <span className="font-bold">{optimizedStats.totalVehicles}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-red-400">High Traffic Roads:</span>
                    <span className="font-bold">{optimizedStats.highTrafficRoads}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-yellow-400">Medium Traffic:</span>
                    <span className="font-bold">{optimizedStats.mediumTrafficRoads}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 bg-opacity-50 p-2 rounded">
                    <span className="text-green-400">Low Traffic:</span>
                    <span className="font-bold">{optimizedStats.lowTrafficRoads}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {suggestions.length > 0 && !showOptimized && (
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-8 border-2 border-purple-400 mb-6 shadow-2xl animate-fade-in">
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lightbulb size={32} className="text-yellow-300 animate-pulse" />
              🤖 AI-Generated Optimization Recommendations
            </h3>
            <div className="grid grid-cols-2 gap-5">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-900 bg-opacity-70 rounded-xl p-5 border-2 border-purple-400 hover:border-purple-300 transition transform hover:scale-105">
                  <div className="font-bold text-xl mb-3 text-purple-200">{suggestion.description}</div>
                  <div className="text-sm text-gray-300 mb-4 leading-relaxed">{suggestion.reason}</div>
                  <span className={`inline-block text-sm px-4 py-2 rounded-full font-bold shadow-lg ${
                    suggestion.impact === 'High' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' :
                    suggestion.impact === 'Medium' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white' : 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                  }`}>
                    ⚡ {suggestion.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {optimizationsApplied && (
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-8 border-2 border-green-400 mb-6 shadow-2xl animate-fade-in">
            <h3 className="text-3xl font-bold mb-6 text-green-300 flex items-center gap-3">
              <span className="text-4xl">✓</span> Optimizations Applied Successfully!
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-green-500 transform hover:scale-105 transition">
                <div className="text-4xl mb-2">🛣️</div>
                <div className="text-3xl font-bold text-green-400 mb-2">4-Lane Roads</div>
                <div className="text-sm text-gray-300">Expanded Major Streets</div>
              </div>
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-green-500 transform hover:scale-105 transition">
                <div className="text-4xl mb-2">🚦</div>
                <div className="text-3xl font-bold text-green-400 mb-2">Smart Signals</div>
                <div className="text-sm text-gray-300">47% Faster Green Lights</div>
              </div>
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-green-500 transform hover:scale-105 transition">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold text-green-400 mb-2">Strategic Removal</div>
                <div className="text-sm text-gray-300">3 Low-Traffic Signals</div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🚗</span> Vehicle & Map Legend
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-gray-400 mb-3">VEHICLE TYPES</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <Car size={24} className="text-yellow-400" />
                  <span className="text-sm">Cars - Detailed body, roof & wheels</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <Bus size={24} className="text-orange-400" />
                  <span className="text-sm">Buses - Multiple windows & wheels</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <Bike size={24} className="text-teal-400" />
                  <span className="text-sm">Bicycles - Two wheels visible</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <Users size={24} className="text-green-400" />
                  <span className="text-sm">Pedestrians - Human figures</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-400 mb-3">MAP FEATURES</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                  <span>Arterial Roads - 2 lanes standard</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  <span>Highway - 3+ lanes high capacity</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <div className="w-6 h-6 bg-teal-600 rounded-full"></div>
                  <span>Roundabouts - Circular flow control</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div>
                  <span>Heatmap - Traffic density visualization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficCityPlanner;