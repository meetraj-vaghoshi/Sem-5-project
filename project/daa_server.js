const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const cloneDistances = (dists) => {
    let clone = {};
    Object.keys(dists).forEach(node => {
        clone[node] = { dist: dists[node].dist, parent: dists[node].parent };
    });
    return clone;
};

const bellmanFord = (edges, source) => {
    const validEdges = edges.filter(e => e.from && e.to && e.from.trim() !== "" && e.to.trim() !== "");
    
    // Treat as undirected: double the edges for routing simulation
    const directedEdges = [];
    validEdges.forEach(e => {
        const weight = parseInt(e.weight) || 0;
        directedEdges.push({ from: e.from, to: e.to, weight });
        directedEdges.push({ from: e.to, to: e.from, weight });
    });

    const nodes = Array.from(new Set(directedEdges.flatMap(e => [e.from, e.to]))).sort();
    
    // distances now stores { dist, parent }
    let distances = {};
    nodes.forEach(node => { 
        distances[node] = { dist: Infinity, parent: null }; 
    });

    if (distances[source]) {
        distances[source] = { dist: 0, parent: null };
    } else {
        // Handle case where source isn't in the edge list yet
        distances[source] = { dist: 0, parent: null };
        if (!nodes.includes(source)) nodes.push(source);
    }

    let iterationSnapshots = [];
    // Initial State (Iteration 0) - Deep copy the distances object
    iterationSnapshots.push({ 
        iteration: 0, 
        dists: cloneDistances(distances)
    });

    const V = nodes.length;
    for (let i = 1; i <= V - 1; i++) {
        let changed = false;
        let new_distances = cloneDistances(distances); // Temporary for synchronous updates
        
        directedEdges.forEach(({ from, to, weight }) => {
            const currentDistFrom = distances[from].dist; // Use old distance
            const currentDistTo = new_distances[to].dist;

            // Bellman-Ford Equation: D(y) = min [ D(y), c(x,y) + D(x) ]
            if (currentDistFrom !== Infinity && currentDistFrom + weight < currentDistTo) {
                new_distances[to] = { 
                    dist: currentDistFrom + weight, 
                    parent: from 
                };
                changed = true;
            }
        });

        distances = new_distances; // Apply all updates at once after full pass

        // Save snapshot after each full pass
        iterationSnapshots.push({ 
            iteration: i, 
            dists: cloneDistances(distances)
        });
        
        if (!changed) break;
    }

    // Negative cycle check
    let hasNegativeCycle = false;
    directedEdges.forEach(({ from, to, weight }) => {
        if (distances[from].dist !== Infinity && distances[from].dist + weight < distances[to].dist) {
            hasNegativeCycle = true;
        }
    });

    return { distances, hasNegativeCycle, iterationSnapshots, nodes };
};

app.post('/api/bellman-ford', (req, res) => {
    const { edges, source } = req.body;
    
    if (!edges || !source) {
        return res.status(400).json({ error: "Missing edges or source node" });
    }

    const result = bellmanFord(edges, source);
    res.json(result);
});

app.listen(5001, () => console.log("DAA Backend running on port 5001"));