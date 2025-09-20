#version 300 es
precision highp float;

in vec2 vUv;
in vec3 vPosition;
in float vTime;

uniform float time;
uniform vec2 resolution;
uniform sampler2D fourierData;
uniform float glowIntensity;
uniform float distortionAmount;
uniform vec3 color1;
uniform vec3 color2;
uniform float frequencyCount;
uniform float animationSpeed;

out vec4 fragColor;

// Noise function for organic effects
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Smooth noise
float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal noise
float fractalNoise(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(st * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

void main() {
    vec2 uv = vUv;
    
    // Time-based animation
    float t = time * animationSpeed;
    
    // Distortion effect
    vec2 distortion = vec2(
        sin(uv.y * 10.0 + t) * 0.02,
        cos(uv.x * 8.0 + t * 1.5) * 0.02
    ) * distortionAmount;
    
    uv += distortion;
    
    // Fourier data sampling
    vec4 fourier = texture(fourierData, uv);
    
    // Create wave patterns based on Fourier data
    float wave1 = sin(uv.x * frequencyCount * 2.0 + t) * fourier.r;
    float wave2 = cos(uv.y * frequencyCount * 1.5 + t * 1.2) * fourier.g;
    float wave3 = sin((uv.x + uv.y) * frequencyCount + t * 0.8) * fourier.b;
    
    // Combine waves
    float combinedWave = (wave1 + wave2 + wave3) / 3.0;
    
    // Add noise for organic feel
    float noiseValue = fractalNoise(uv * 5.0 + t * 0.1);
    combinedWave += noiseValue * 0.1;
    
    // Color mixing
    vec3 color = mix(color1, color2, combinedWave * 0.5 + 0.5);
    
    // Add glow effect
    float glow = abs(combinedWave) * glowIntensity;
    color += vec3(glow) * color1;
    
    // Add chromatic aberration
    float aberration = 0.01;
    vec2 redOffset = uv + vec2(aberration, 0.0);
    vec2 blueOffset = uv - vec2(aberration, 0.0);
    
    float red = texture(fourierData, redOffset).r;
    float blue = texture(fourierData, blueOffset).b;
    
    color.r += red * 0.3;
    color.b += blue * 0.3;
    
    // Final color with alpha
    fragColor = vec4(color, 1.0);
}
