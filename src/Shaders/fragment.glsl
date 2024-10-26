uniform float uTime;
uniform vec3 uColor;

varying vec3  vPosition;
varying vec3 vNormal;

void main()
{
    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 3.0);

    // Fallof
    float fallof = smoothstep(0.8, 0.0, fresnel);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 2.25;
    holographic *= fallof;

    // Final color
    gl_FragColor = vec4(uColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}