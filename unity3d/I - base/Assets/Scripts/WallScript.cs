using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WallScript : MonoBehaviour
{
    public MeshRenderer MeshRender;
    //public GameObject Spotlight;
    void Start()
    {
        MeshRender = GetComponent<MeshRenderer>();
    }

    private void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.GetComponent<BoxCollideScript>().HasCollided)
            return;
        Color _col = Color.HSVToRGB(Random.ColorHSV().r, Random.ColorHSV().g, Random.ColorHSV().b);
        MeshRender.material.color = _col;
        //Spotlight.GetComponent<Light>().color = _col;
        collision.gameObject.GetComponent<BoxCollideScript>().HasCollided = true;
    }
}
