#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;
uniform vec2 resolution;

out vec2 vUv;
out vec3 vPosition;
out float vTime;

void main() {
    vUv = uv;
    vPosition = position;
    vTime = time;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
