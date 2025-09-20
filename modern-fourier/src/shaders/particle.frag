#version 300 es
precision highp float;

in float vLife;
in float vSize;
in vec3 vVelocity;

uniform float time;
uniform vec3 color1;
uniform vec3 color2;
uniform float glowIntensity;

out vec4 fragColor;

void main() {
    // Circular particle shape
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Fade based on distance from center
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Life-based fading
    alpha *= vLife;
    
    // Color based on velocity magnitude
    float velocityMagnitude = length(vVelocity);
    vec3 color = mix(color1, color2, velocityMagnitude * 0.1);
    
    // Add glow effect
    color += vec3(alpha * glowIntensity);
    
    // Add some sparkle
    float sparkle = sin(time * 10.0 + vLife * 20.0) * 0.5 + 0.5;
    color += vec3(sparkle * 0.3);
    
    fragColor = vec4(color, alpha);
}
