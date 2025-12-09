// K-Nearest Neighbors classifier for crop stress detection
class CropGuardKNN {
  constructor() {
    // Training data: [R, G, B, label]
    // Based on VOC detection patterns
    this.trainingData = [
      // Healthy samples (green colors)
      { features: [34, 139, 34], label: 'Healthy', confidence: 0.95 },
      { features: [50, 180, 50], label: 'Healthy', confidence: 0.93 },
      { features: [60, 200, 60], label: 'Healthy', confidence: 0.94 },
      
      // Biotic stress (fungal/insect - brownish)
      { features: [139, 69, 19], label: 'Biotic Stress', confidence: 0.91 },
      { features: [160, 82, 45], label: 'Biotic Stress', confidence: 0.88 },
      { features: [180, 100, 60], label: 'Biotic Stress', confidence: 0.90 },
      
      // Abiotic stress (drought/aging - yellowish)
      { features: [200, 200, 100], label: 'Abiotic Stress', confidence: 0.89 },
      { features: [220, 200, 120], label: 'Abiotic Stress', confidence: 0.85 },
    ];
    this.k = 3;
  }

  euclideanDistance(p1, p2) {
    return Math.sqrt(p1.reduce((sum, val, i) => sum + (val - p2[i]) ** 2, 0));
  }

  classify(rgb) {
    const distances = this.trainingData.map(data => ({
      ...data,
      distance: this.euclideanDistance(rgb, data.features),
    }));
    distances.sort((a, b) => a.distance - b.distance);
    const nearest = distances.slice(0, this.k);

    const votes = {};
    nearest.forEach(item => {
      votes[item.label] = (votes[item.label] || 0) + 1;
    });

    const label = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
    const sameLabel = nearest.filter(n => n.label === label);
    const confidence = sameLabel.reduce((sum, item) => sum + item.confidence, 0) / sameLabel.length;

    return { label, confidence: Math.round(confidence * 100), nearest: sameLabel };
  }
}

const getRecommendation = (label) => {
  const recommendations = {
    'Healthy': {
      title: '✅ Plant is Healthy',
      message: 'No intervention needed.',
      action: 'Continue monitoring',
      color: 'bg-green-100',
    },
    'Biotic Stress': {
      title: '⚠️ Biotic Stress (Fungal/Insect)',
      message: 'Early infection detected.',
      action: 'Apply fungicide within 24 hours',
      color: 'bg-orange-100',
    },
    'Abiotic Stress': {
      title: '⚠️ Abiotic Stress (Drought)',
      message: 'Water/nutrient stress identified.',
      action: 'Increase irrigation',
      color: 'bg-yellow-100',
    },
  };
  return recommendations[label] || recommendations['Healthy'];
};

export { CropGuardKNN, getRecommendation };
