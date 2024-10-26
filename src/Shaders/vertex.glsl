uniform float uTime;
uniform float glitchStrengthFactor;
uniform float sinFactor1;
uniform float sinFactor2;
uniform float smoothstepMin;
uniform float smoothstepMax;

varying vec3 vPosition;
varying vec3 vNormal;

float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = 
        sin(glitchTime) + 
        sin(glitchTime * sinFactor1) + 
        sin(glitchTime * sinFactor2);
    glitchStrength /= 2.5;
    glitchStrength = smoothstep(smoothstepMin, smoothstepMax, glitchStrength);
    glitchStrength *= glitchStrengthFactor;
    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Varyings
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}