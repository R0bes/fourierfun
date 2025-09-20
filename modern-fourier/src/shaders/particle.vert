#version 300 es
precision highp float;

in vec3 position;
in vec3 velocity;
in float life;
in float size;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform vec3 cameraPosition;

out float vLife;
out float vSize;
out vec3 vVelocity;

void main() {
    vLife = life;
    vSize = size;
    vVelocity = velocity;
    
    // Animated position based on velocity and time
    vec3 animatedPosition = position + velocity * time;
    
    vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size based on life and distance to camera
    float distanceToCamera = length(cameraPosition - animatedPosition);
    gl_PointSize = size * (life + 0.1) * (100.0 / distanceToCamera);
}
