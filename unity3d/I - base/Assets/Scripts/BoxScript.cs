using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BoxScript : MonoBehaviour
{
    public GameObject BoxPrefab;
    // Start is called before the first frame update
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyUp(KeyCode.Space))
        {
            float x, y, z;
            GameObject _box = Instantiate<GameObject>(BoxPrefab);
            Rigidbody _rd = _box.GetComponent<Rigidbody>();
            Random r = new Random();
            _box.transform.position = new Vector3(0.164f, -0.526f, -10.222f);
            x = Random.Range(-40f, 40f);
            y = Random.Range(360f, 400f);
            z = Random.Range(250f, 280f);
            _rd.AddForce(x,y,z);
        }
    }
    private void FixedUpdate()
    {

    }
}
